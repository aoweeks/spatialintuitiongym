import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, Output, EventEmitter, Injector } from '@angular/core';
import { MathsUtilsService } from 'src/app/services/maths-utils.service';
import { BaseCanvasComponent } from '../base-canvas.component';
import { CubeStackCanvasesService } from '../pages/cube-stack/cube-stack-canvases.service';

@Component({
  selector: 'app-base-2d-canvas',
  templateUrl: './base-2d-canvas.component.html',
  styleUrls: ['./base-2d-canvas.component.scss'],
})
export class Base2dCanvasComponent extends BaseCanvasComponent implements AfterViewInit{

  @ViewChild('2dCanvas') canvasRef: ElementRef;

  @Output() undoHistoryEvent = new EventEmitter<boolean>();
  @Output() redoHistoryEvent = new EventEmitter<boolean>();
  @Output() canvasEmptyEvent = new EventEmitter<boolean>();
  @Output() snappingChangeEvent = new EventEmitter<boolean>();


  guiParams = {
    resetCanvas: () => this.resetCanvas(),
    undo: () => this.undo(),
    redo: () => this.redo(),
    toggleSnapping: () => this.toggleSnapping(),
  };

  private context: CanvasRenderingContext2D;

  private snappingOn = true;
  private tempSnappingSwitch = false;

  private mouseDownPos = { x: 0, y : 0 };
  private lastCursorPos = null;
  private currentConstraint = null;

  private pointsToMove = [];

  private lines = [];

  private cameraSettings = {
    zoomFactor: 1,
    offsets: { xOffset: 0, yOffset: 0 }
  };

  private undoHistory = [];
  private redoHistory = [];

  // @Input()
  // undoButtonPressed() {

  // }

  constructor(  injector: Injector,
                private mathsUtilsService: MathsUtilsService,
                private cubeStackCanvasesService: CubeStackCanvasesService) {
    super(injector);
  }

  // Keyboard events
  @HostListener('window:keydown',['$event'])
  public keyDown(event: KeyboardEvent) {

    if( (event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'Z') ) {
      this.undo();
    } else if( (event.ctrlKey || event.metaKey) && (event.key === 'y' || event.key === 'Y') ) {
      this.redo();
    } else if (event.shiftKey) {
      this.tempSnappingSwitch = true;
      this.emitTempSnappingEvent();
    }
  }


      // //! Temp
      // const vertices = this.cubeStackCanvasesService.getCubeVisibleVertices();
      // console.log(vertices);
      // this.clearCanvas();
      // vertices.forEach( (vertex) => {
      //   this.context.beginPath();
      //   this.context.arc(vertex.x, vertex.y, 3, 0, Math.PI*2);
      //   this.context.stroke();
      // });

  @HostListener('window:keyup',['$event'])
  public keyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.tempSnappingSwitch = false;
      this.emitTempSnappingEvent();
    }
  }

  ngAfterViewInit() {
    this.context = this.canvasRef.nativeElement.getContext('2d');
    super.ngAfterViewInit();
    this.updateCanvasSizes();

    this.cubeStackCanvasesService.cameraChange.subscribe( (cameraSettings: any) => {
      this.cameraSettings.zoomFactor = cameraSettings.zoomFactor;
      this.cameraSettings.offsets.xOffset = cameraSettings.xOffset;
      this.cameraSettings.offsets.yOffset = cameraSettings.yOffset;
      this.clearCanvas();
      this.drawPreviousLines();
    });

    // dat.GUI tweaks
    this.debugService.gui.add(this.guiParams, 'resetCanvas');
    this.debugService.gui.add(this.guiParams, 'undo');
    this.debugService.gui.add(this.guiParams, 'redo');
    this.debugService.gui.add(this.guiParams, 'toggleSnapping');
  }

  public updateCanvasSizes(): void {

    const pixelDensity = Math.min(window.devicePixelRatio, 2);
    this.canvasRef.nativeElement.height = this.viewportSizes.height * pixelDensity;
    this.canvasRef.nativeElement.width = this.viewportSizes.width * pixelDensity;
    this.context.scale( pixelDensity, pixelDensity );

    this.drawPreviousLines();
  }

  public toggleSnapping(): void {
    this.snappingOn = !this.snappingOn;
    this.snappingChangeEvent.emit(this.snappingOn);
  }

  /**
   * Undo/Redo
   */

  public undo(): void {
    if ( this.undoHistory.length ) {

      this.cancelLine();

      this.redoHistory.push( this.lines );
      this.lines = this.undoHistory.pop();

      this.redoHistoryEvent.emit(true);

      this.clearCanvas();
      this.drawPreviousLines();

      if ( !this.undoHistory.length ) {
        this.undoHistoryEvent.emit(false);
      }

      if ( this.lines.length ) {
        this.canvasEmptyEvent.emit(false);
      } else {
        this.canvasEmptyEvent.emit(true);
      }
    }
  }

  public redo(): void {
    if ( this.redoHistory.length ) {

      this.cancelLine();

      this.undoHistory.push( this.lines );
      this.lines = this.redoHistory.pop();

      this.undoHistoryEvent.emit( true );
      this.canvasEmptyEvent.emit( false );

      this.clearCanvas();
      this.drawPreviousLines();

      if ( !this.redoHistory.length ) {
        this.redoHistoryEvent.emit( false );
      }
    }
  }

  public resetCanvas(): void {
    this.saveCurrentStateToUndoHistory();
    this.clearCanvas();
    this.lines = [];
    this.canvasEmptyEvent.emit(true);
    this.clearRedoHistory();
  }

  /**
   *  Mouse Event Handlers
   */

  public mouseDown( event: MouseEvent): void {

      if( event.button === 0 ) {
        // prevent firing if right button is already clicked
        if(event.buttons === 1) {
          this.setLineStart(event.clientX, event.clientY);
        }
      } else if ( event.button === 2 ) {
        this.movePoint(event);
      }
  }

  public mouseMove( event: MouseEvent | TouchEvent ): void {

    const cursorPos = this.extractPosFromMouseOrTouchEvent( event );
    let offsetPoint = this.offsetPoint( cursorPos );

    // If a line is being drawn
    if( this.lastCursorPos ) {

      this.clearCanvas();
      this.drawPreviousLines();

      let snapPoint;
      if ( this.currentConstraint ) {
        snapPoint = this.mathsUtilsService.closestPointOnLine( offsetPoint, this.currentConstraint );
      } else {
        snapPoint = this.checkForSnapPoint( offsetPoint.x, offsetPoint.y );
      }


      // Draw current line
      this.drawLine(this.mouseDownPos, snapPoint );

      this.lastCursorPos = snapPoint;
    }

    // If a point is being moved
    if ( this.pointsToMove.length ) {

      if( this.currentConstraint ){
        offsetPoint = this.mathsUtilsService.closestPointOnLine( offsetPoint, this.currentConstraint );
        offsetPoint.constraint = this.currentConstraint;
      }

      for(const point of this.pointsToMove ) {
        if ( point.pos === 'start') {
          this.lines[point.index].start = offsetPoint;
        } else {
          this.lines[point.index].end = offsetPoint;
        }
      }

      this.clearCanvas();
      this.drawPreviousLines();
    }
  }

  public mouseUp( event: MouseEvent ) {
    if ( event.button === 0 ) {
      this.setLineEnd( this.lastCursorPos.x, this.lastCursorPos.y, this.currentConstraint );
    } else if ( event.button === 2 ) {
      this.pointsToMove = [];

      this.clearRedoHistory();
    }

    this.clearCanvas();
    this.drawPreviousLines();
  }


  public movePoint(event: MouseEvent | PointerEvent ) {

    this.currentConstraint = null;
    this.saveCurrentStateToUndoHistory();

    const cursorPos = this.extractPosFromMouseOrTouchEvent( event );
    const offsetPoint = this.offsetPoint(cursorPos);
    const snapPoint = this.checkForSnapPoint( offsetPoint.x, offsetPoint.y, true );

    this.lines.forEach( (line, index) => {

      // let constrained = null;
      // ? Workaround: line.start === snappoint was only firing once per loop?!
      if ( line.start.x === snapPoint.x && line.start.y === snapPoint.y) {
        if ( line.start.constraint ) {
          this.currentConstraint = line.start.constraint;
        }
        this.pointsToMove.push( { index, pos: 'start' } );
      } else if ( line.end.x === snapPoint.x && line.end.y === snapPoint.y ) {
        if ( line.end.constraint ) {
          this.currentConstraint = line.end.constraint;
        }
        this.pointsToMove.push( { index, pos: 'end' } );
      }

      // if( constrained ) {
      //   this.currentConstraint = line.start.constraint || line.end.constraint;
      //   if( this.currentConstraint?.axisIndicator === true ) {
      //     console.log()
      //     this.currentConstraint = null;
      //     this.pointsToMove = [];
      //     return;
      //   }
      // }
    });
  }

  public rightClick( event: MouseEvent ) {

    this.cancelLine();

    event.stopImmediatePropagation();
    event.preventDefault();
    return false;
  }

/**
 * Touch Handlers
 */

  public touchPress( event ) {

    // Cancel the effects of the initial touch
    this.cancelLine();

    this.movePoint( event.srcEvent );
  }

  public touchStart( event: TouchEvent ) {
    this.setLineStart(event.touches[0].clientX, event.touches[0].clientY);
  }

  public touchEnd( event: TouchEvent ) {

    // If a line is being drawn
    if(this.lastCursorPos) {
      this.setLineEnd( this.lastCursorPos.x, this.lastCursorPos.y, this.currentConstraint );
    } else {
      this.pointsToMove = [];
      this.currentConstraint = null;
      this.clearRedoHistory();

      this.clearCanvas();
      this.drawPreviousLines();
    }
  }

  public touchPan(event): void {
    // console.log(event);
    // console.log(event.maxPointers)
    // if (event.maxPointers === 2) {
    //   this.cubeStackCanvasesService.updateOffsets(event.deltaX, event.deltaY);
    // }
  }

  public touchTap(event): void {

    if(event.maxPointers === 2) {
      console.log('TWO');
      this.undo();
    } else if(event.maxPointers === 3) {

      console.log('THREE');
      this.redo();
    }
  }

  public touchPinch(event): void {
    console.log(event);
    this.cancelLine();
    if (event.maxPointers === 2) {
      const xOffset = (event.deltaX / 100) * -1;
      const yOffset = (event.deltaY / 100) * -1;
      this.cubeStackCanvasesService.updateOffsets( xOffset, yOffset );
    }
  }

  private extractPosFromMouseOrTouchEvent(event: MouseEvent | TouchEvent | PointerEvent ) {

    let x: number;
    let y: number;

    if (event instanceof TouchEvent) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }


    return { x, y };
  }

  /**
   * Line Drawing Functions
   */

  private setLineStart(cursorPosX, cursorPosY) {

    const offsetPoint = this.offsetPoint( {x: cursorPosX, y: cursorPosY } );
    const snapPoint = this.checkForSnapPoint( offsetPoint.x, offsetPoint.y );
    if( snapPoint.constraint?.axisIndicator ) {
      this.currentConstraint = snapPoint.constraint;
      this.currentConstraint.axisIndicator = false;
    }
    this.mouseDownPos = snapPoint;
    this.lastCursorPos = snapPoint;
  }

  private setLineEnd( cursorPosX, cursorPosY, constraint ) {

    const snapPoint = this.checkForSnapPoint( cursorPosX, cursorPosY );

    this.currentConstraint = null;

    if ( this.mouseDownPos !== snapPoint ) {

      // Check line doesn't already exist
      let lineDuplicated = false;
      for ( const line of this.lines ) {
        if ( (    ( this.mouseDownPos.x === line.start.x && this.mouseDownPos.y === line.start.y ) ||
                  ( this.mouseDownPos.x === line.end.x && this.mouseDownPos.y === line.end.y ) )
            && (  ( snapPoint.x === line.start.x && snapPoint.y === line.start.y ) ||
                  ( snapPoint.x === line.end.x && snapPoint.y === line.end.y ) )
        ) {
          lineDuplicated = true;
        }
      }

      if (!lineDuplicated) {

        this.saveCurrentStateToUndoHistory();
        this.canvasEmptyEvent.emit(false);
        // Save line
        this.lines.push({
          start: {
            x: this.mouseDownPos.x,
            y: this.mouseDownPos.y,
            constraint
          },
          end: {
            x: snapPoint.x,
            y: snapPoint.y,
            constraint
          }
        });
        this.clearRedoHistory();
      }
    }

    this.lastCursorPos = false;
  }

  private drawLine(
    start: any,
    end: any
  ): void {
    const offsetStart = this.unoffsetPoint(start);
    const offsetEnd = this.unoffsetPoint(end);

    this.context.beginPath();

    this.context.lineWidth = 5;
    this.context.lineCap = 'round';
    this.context.setLineDash([10, 10]);
    this.context.strokeStyle = 'white';

    this.context.moveTo( offsetStart.x, offsetStart.y );
    this.context.lineTo( offsetEnd.x, offsetEnd.y );
    this.context.stroke();
  }

  private drawPreviousLines(): void {
    for ( const line of this.lines ) {
      this.drawLine(line.start, line.end);
    }
  }

  private saveCurrentStateToUndoHistory(): void {
    const undoHistoryItem = [];
    for(const line of this.lines) {
      undoHistoryItem.push( {...line} );
    };
    this.undoHistory.push(undoHistoryItem);
    this.undoHistoryEvent.emit(true);
  }

  private clearRedoHistory(): void {
    this.redoHistory = [];
    this.redoHistoryEvent.emit(false);
  }

  private cancelLine(): void {
    this.lastCursorPos = null;
    this.mouseDownPos = null;
    this.currentConstraint = null;

    this.clearCanvas();
    this.drawPreviousLines();
  }

  /**
   * Other canvas based functions
   */

  private clearCanvas(): void {

    this.context.clearRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height
    );
  }

  // Given a point A, and a list of other points, returns either the nearest
  // point to A, or null if none are within a given radius
  private getNearestPoint(
    originPointX: number,
    originPointY: number,
    pointsToCompare,
    radius: number = 50) {

    let nearestPoint = {x: originPointX, y: originPointY, constraint: null};

    for ( const pointToCompare of pointsToCompare ) {
      const distance = this.mathsUtilsService.distanceBetweenPoints(nearestPoint, pointToCompare);
      if ( distance < radius ) {
        nearestPoint = pointToCompare;
        radius = distance;
      }

      if ( pointToCompare.constraint?.axisIndicator === true ) {
        if ( distance <= radius ) {
          // console.log('axisIndicator');
          nearestPoint = pointToCompare;
          radius = distance;
        }
      }
    }

    return nearestPoint;
  }

  private checkForSnapPoint( x: number, y: number, overrideSnappingBehaviour = false ) {

    const snappingOn  = this.tempSnappingSwitch ? !this.snappingOn : this.snappingOn;
    if( ( snappingOn ) || overrideSnappingBehaviour ) {
      const pointsArray = this.arrayOfLinePoints();
      const nearestPoint = this.getNearestPoint(x, y, pointsArray);

      return nearestPoint;
    } else{
      return {x, y, constraint: null};
    }
  }

  private offsetPoint( point: any ): any {
    const offsetPoint = { ...point };

    let zoomedX = point.x / this.cameraSettings.zoomFactor;
    zoomedX += this.cameraSettings.offsets.xOffset * this.cameraSettings.zoomFactor;
    zoomedX -= (this.viewportSizes.width / 2);

    let zoomedY = point.y / this.cameraSettings.zoomFactor;
    zoomedY += this.cameraSettings.offsets.yOffset * this.cameraSettings.zoomFactor;
    zoomedY -= (this.viewportSizes.height / 2);

    offsetPoint.x = zoomedX;
    offsetPoint.y = zoomedY;

    return offsetPoint;
  }

  private unoffsetPoint( point: any ): any {
    const offsetPoint = { ...point };
    // Multiply by zoom factor, add zoomed offset, minus viewport/2
    let zoomedX = point.x * this.cameraSettings.zoomFactor;
    zoomedX -= this.cameraSettings.offsets.xOffset * this.cameraSettings.zoomFactor;
    zoomedX += (this.viewportSizes.width / 2);

    let zoomedY = point.y * this.cameraSettings.zoomFactor;
    zoomedY -= this.cameraSettings.offsets.yOffset * this.cameraSettings.zoomFactor;
    zoomedY += (this.viewportSizes.height / 2);

    offsetPoint.x = zoomedX;
    offsetPoint.y = zoomedY;

    return offsetPoint;
  }

  private arrayOfLinePoints() {
    const axisIndicatorPointsArray = [];
    for(  const point of this.cubeStackCanvasesService.getSnapPoints() ) {
      axisIndicatorPointsArray.push( point );
    }

    // Filter out the end of the axisIndicators if there is already a line connected to them
    const aiPointsCopyArray = axisIndicatorPointsArray.filter(
      ( point, index ) => {

        // Ignore the corner point
        if ( index === 0 ) {
          return true;
        }
        for ( const line of this.lines ) {
          if( line.start.x === point.x && line.start.y === point.y ) {
            return false;
          }
          if( line.end.x === point.x && line.end.y === point.y ) {
            return false;
          }
        }
        return true;
      }
    );

    const linePointsArray = [];
    // Filter out the end of thelines if they come from axisIndicators
    for ( const line of this.lines ) {
      let startUnique = true;
      let endUnique = true;

      for ( const point of axisIndicatorPointsArray ) {
        if ( line.start.x === point.x && line.start.y === point.y ) {
          startUnique = false;
        }
        if ( line.end.x === point.x && line.end.y === point.y ) {
          endUnique = false;
        }
      }

      if ( startUnique ) {
        linePointsArray.push( line.start );
      }

      if ( endUnique ) {
        linePointsArray.push( line.end );
      }
    }
    const pointsArray = aiPointsCopyArray.concat( linePointsArray );
    return pointsArray;
  }

  private emitTempSnappingEvent() {
    const snappingOn = this.tempSnappingSwitch ? !this.snappingOn : this.snappingOn;
    this.snappingChangeEvent.emit( snappingOn );
  }

}
