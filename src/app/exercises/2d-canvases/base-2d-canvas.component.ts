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

  private mouseDownPos = { x: 0, y : 0};
  private lastCursorPos = null;
  private currentConstraint = null;

  private pointsToMove = [];

  private lines = [];

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

    // dat.GUI tweaks
    this.debugService.gui.add(this.guiParams, 'resetCanvas');
    this.debugService.gui.add(this.guiParams, 'undo');
    this.debugService.gui.add(this.guiParams, 'redo');
    this.debugService.gui.add(this.guiParams, 'toggleSnapping');
  }

  public updateCanvasSizes(): void {
    this.canvasRef.nativeElement.height = this.viewportSizes.height;
    this.canvasRef.nativeElement.width = this.viewportSizes.width;

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

      this.undoHistory.push( this.lines );
      this.lines = this.redoHistory.pop();

      this.undoHistoryEvent.emit(true);
      this.canvasEmptyEvent.emit(false);

      this.clearCanvas();
      this.drawPreviousLines();

      if ( !this.redoHistory.length ) {
        this.redoHistoryEvent.emit(false);
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

    // If a line is being drawn
    if( this.lastCursorPos ) {

      this.clearCanvas();
      this.drawPreviousLines();

      let snapPoint;
      if ( this.currentConstraint ) {
        snapPoint = this.mathsUtilsService.closestPointOnLine(cursorPos, this.currentConstraint);
      } else {
        snapPoint = this.checkForSnapPoint( cursorPos.x, cursorPos.y );
      }


      // Draw current line
      this.drawLine(this.mouseDownPos, snapPoint );

      this.lastCursorPos = snapPoint;
    }

    // If a point is being moved
    if ( this.pointsToMove.length ) {

      for(const point of this.pointsToMove ) {
        if ( point.pos === 'start') {
          this.lines[point.index].start = cursorPos;
        } else {
          this.lines[point.index].end = cursorPos;
        }
      }

      this.clearCanvas();
      this.drawPreviousLines();
    }
  }

  public mouseUp( event: MouseEvent ) {
    if ( event.button === 0 ) {
      this.setLineEnd(this.lastCursorPos.x, this.lastCursorPos.y);
    } else if ( event.button === 2 ) {
      this.pointsToMove = [];

      this.clearRedoHistory();
    }

    this.clearCanvas();
    this.drawPreviousLines();
  }


  public movePoint(event: MouseEvent | PointerEvent ) {

    this.saveCurrentStateToUndoHistory();

    const cursorPos = this.extractPosFromMouseOrTouchEvent( event );
    const snapPoint = this.checkForSnapPoint( cursorPos.x, cursorPos.y, true );

    // for( const [index, line] of this.lines.entries() ) {
    this.lines.forEach( (line, index) => {

      // ? Workaround: line.start === snappoint was only firing once per loop?!
      if ( line.start.x === snapPoint.x && line.start.y === snapPoint.y) {
        this.pointsToMove.push( { index, pos: 'start' } );
      } else if ( line.end.x === snapPoint.x && line.end.y === snapPoint.y ) {
        this.pointsToMove.push( { index, pos: 'end' } );
      }
    });

  }

  public rightClick( event: MouseEvent ) {

    event.stopImmediatePropagation();
    event.preventDefault();
    return false;
  }

/**
 * Touch Handlers
 */

  public touchPress( event ) {

    // Cancel the effects of the initial touch
    this.lastCursorPos = null;
    this.mouseDownPos = null;
    this.currentConstraint = null;

    this.movePoint( event.srcEvent );
  }

  public touchStart( event: TouchEvent ) {
    this.setLineStart(event.touches[0].clientX, event.touches[0].clientY);
  }

  public touchEnd( event: TouchEvent ) {

    // If a line is being drawn
    if(this.lastCursorPos) {
      this.setLineEnd( this.lastCursorPos.x, this.lastCursorPos.y );
    } else {
      this.pointsToMove = [];
      this.clearRedoHistory();

      this.clearCanvas();
      this.drawPreviousLines();
    }
  }

  public touchPan(event): void {
    // console.log(event.maxPointers);
  }

  public touchTap(event): void {

    // console.log('TAP');
    // if(event.maxPointers === 2) {
    //   console.log('TWO');
    //   this.undo();
    // } else if(event.maxPointers === 3) {

    //   console.log('THREE');
    //   this.redo();
    // }
  }

  public touchPinch(event): void {
    console.log('Ouch!');
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

    const snapPoint = this.checkForSnapPoint( cursorPosX, cursorPosY );
    if(snapPoint.constraint) {
      this.currentConstraint = snapPoint.constraint;
    }
    this.mouseDownPos = snapPoint;
    this.lastCursorPos = snapPoint;
  }

  private setLineEnd( cursorPosX, cursorPosY ) {
    const snapPoint = this.checkForSnapPoint( cursorPosX, cursorPosY );
    this.currentConstraint = null;

    if ( this.mouseDownPos !== snapPoint ) {

      // Check line doesn't already exist
      let lineDuplicated = false;
      for ( const line of this.lines ) {
        if ( (    (this.mouseDownPos.x === line.start.x && this.mouseDownPos.y === line.start.y ) ||
                  (this.mouseDownPos.x === line.end.x && this.mouseDownPos.y === line.end.y ) )
            && (  (snapPoint.x === line.start.x && snapPoint.y === line.start.y ) ||
                  (snapPoint.x === line.end.x && snapPoint.y === line.end.y ) )
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
            constraint: null
          },
          end: {
            x: snapPoint.x,
            y: snapPoint.y,
            constraint: null
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
    this.context.beginPath();

    this.context.lineWidth = 5;
    this.context.lineCap = 'round';
    this.context.setLineDash([10, 10]);
    this.context.strokeStyle = 'white';

    this.context.moveTo(start.x, start.y);
    this.context.lineTo(end.x, end.y);
    this.context.stroke();
  }

  private drawPreviousLines(): void {
    for ( const line of this.lines ) {
      this.drawLine(line.start, line.end);
    }
  }

  private saveCurrentStateToUndoHistory() {
    const undoHistoryItem = [];
    for(const line of this.lines) {
      undoHistoryItem.push( {...line} );
    };
    this.undoHistory.push(undoHistoryItem);
    this.undoHistoryEvent.emit(true);
  }

  private clearRedoHistory() {
    this.redoHistory = [];
    this.redoHistoryEvent.emit(false);
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
      if( distance < radius) {
        nearestPoint = pointToCompare;
        radius = distance;
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

  private arrayOfLinePoints() {
    const pointsArray = [];
    for(  const point of this.cubeStackCanvasesService.getSnapPoints() ) {
      pointsArray.push(point);
    }
    for ( const line of this.lines ) {
      pointsArray.push( line.start );
      pointsArray.push( line.end );
    }
    return pointsArray;
  }

  private emitTempSnappingEvent() {

    const snappingOn = this.tempSnappingSwitch ? !this.snappingOn : this.snappingOn;
    this.snappingChangeEvent.emit(snappingOn);
  }


}
