import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas.component';

@Component({
  selector: 'app-base-2d-canvas',
  templateUrl: './base-2d-canvas.component.html',
  styleUrls: ['./base-2d-canvas.component.scss'],
})
export class Base2dCanvasComponent extends BaseCanvasComponent implements AfterViewInit{

  @ViewChild('2dCanvas') canvasRef: ElementRef;

  guiParams = {
    resetCanvas: () => this.resetCanvas(),
    undo: () => this.undo(),
    redo: () => this.redo()
  };

  private context;

  private mouseDownPos = { x: 0, y : 0};
  private lastCursorPos = null;

  private pointsToMove = [];

  private lines = [];

  private undoHistory = [];
  private redoHistory = [];

  // Keyboard events
  @HostListener('window:keydown',['$event'])
  public keyDown(event: KeyboardEvent) {

    if( (event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'Z') ) {
      this.undo();
    } else if( (event.ctrlKey || event.metaKey) && (event.key === 'y' || event.key === 'Y') ) {
      this.redo();
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
  }

  public updateCanvasSizes(): void {
    this.canvasRef.nativeElement.height = this.viewportSizes.height;
    this.canvasRef.nativeElement.width = this.viewportSizes.width;

    this.drawPreviousLines();
  }

  /**
   *  Mouse Event Handlers
   */

  public mouseDown( event: MouseEvent): void {

      if( event.button === 0 ) {
        this.setLineStart(event.clientX, event.clientY);
      } else if ( event.button === 2 ) {

        this.saveCurrentStateToUndoHistory();
        this.movePoint(event);
      }
  }

  public mouseMove( event: MouseEvent | TouchEvent ): void {

    const cursorPos = this.extractPosFromMouseOrTouchEvent( event );

    // If a line is being drawn
    if( this.lastCursorPos ) {

      this.clearCanvas();
      this.drawPreviousLines();

      const snapPoint = this.checkForSnapPoint( cursorPos.x, cursorPos.y );

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

      // Clear redo history
      this.redoHistory.length = 0;
    }

    this.clearCanvas();
    this.drawPreviousLines();
  }

  public movePoint(event: MouseEvent ) {

    const cursorPos = this.extractPosFromMouseOrTouchEvent( event );
    const snapPoint = this.checkForSnapPoint( cursorPos.x, cursorPos.y );

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

  public rightClick(event: MouseEvent) {

    event.stopImmediatePropagation();
    event.preventDefault();
    return false;
  }

/**
 * Touch Handlers
 */

  public touchStart(event: TouchEvent) {
    this.setLineStart(event.touches[0].clientX, event.touches[0].clientY);
  }

  public touchEnd(event: TouchEvent) {
    this.setLineEnd(this.lastCursorPos.x, this.lastCursorPos.y);
  }

  private extractPosFromMouseOrTouchEvent(event: MouseEvent | TouchEvent) {

    let x: number;
    let y: number;

    if (event instanceof MouseEvent) {
      x = event.clientX;
      y = event.clientY;
    } else {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    }

    return { x, y };

  }

  /**
   * Line Drawing Functions
   */

  private setLineStart(cursorPosX, cursorPosY) {

    const snapPoint = this.checkForSnapPoint( cursorPosX, cursorPosY );
    this.mouseDownPos = snapPoint;
    this.lastCursorPos = snapPoint;
  }

  private setLineEnd( cursorPosX, cursorPosY ) {
    const snapPoint = this.checkForSnapPoint( cursorPosX, cursorPosY );

    if ( this.mouseDownPos !== snapPoint ) {

      this.saveCurrentStateToUndoHistory();

      // Save line
      this.lines.push({
        start: {
          x: this.mouseDownPos.x,
          y: this.mouseDownPos.y
        },
        end: {
          x: snapPoint.x,
          y: snapPoint.y
        }
      });
    }

    this.lastCursorPos = false;

    // Clear redo history
    this.redoHistory.length = 0;
  }

  private drawLine(
    start: any,
    end: any
  ): void {
    this.context.beginPath();

    this.context.lineWidth = 5;
    this.context.lineCap = 'round';

    this.context.moveTo(start.x, start.y);
    this.context.lineTo(end.x, end.y);
    this.context.stroke();
  }

  private drawPreviousLines(): void {
    for ( const line of this.lines ) {
      this.drawLine(line.start, line.end);
    }
  }

  private undo(): void {
    if ( this.undoHistory.length ) {

      this.redoHistory.push( this.lines );
      this.lines = this.undoHistory.pop();

      this.clearCanvas();
      this.drawPreviousLines();
    }
  }

  private redo(): void {
    if ( this.redoHistory.length ) {

      this.undoHistory.push( this.lines );
      this.lines = this.redoHistory.pop();

      this.clearCanvas();
      this.drawPreviousLines();
    }
  }

  private saveCurrentStateToUndoHistory() {
    const undoHistoryItem = [];
    for(const line of this.lines) {
      undoHistoryItem.push( {...line} );
    };
    this.undoHistory.push(undoHistoryItem);
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

  private resetCanvas(): void {
    this.saveCurrentStateToUndoHistory();
    this.clearCanvas();
    this.lines = [];
  }

  // Given a point A, and a list of other points, returns either the nearest
  // point to A, or null if none are within a given radius
  private getNearestPoint(
    originPointX: number,
    originPointY: number,
    pointsToCompare,
    radius: number = 50) {

    let nearestPoint = {x: originPointX, y: originPointY};

    for ( const pointToCompare of pointsToCompare ) {
      const distance = this.distanceBetweenPoints(nearestPoint, pointToCompare);
      if( distance < radius) {
        nearestPoint = pointToCompare;
        radius = distance;
      }
    }

    return nearestPoint;
  }

  private checkForSnapPoint(x: number, y: number) {
    const pointsArray = this.arrayOfLinePoints();
    let nearestPoint = null;
    nearestPoint = this.getNearestPoint(x, y, pointsArray);

    return nearestPoint;
  }

  private arrayOfLinePoints() {
    const pointsArray = [];
    for ( const line of this.lines ) {
      pointsArray.push( line.start );
      pointsArray.push( line.end );
    }
    return pointsArray;
  }

  private distanceBetweenPoints(firstPoint, secondPoint) {
    const x = firstPoint.x - secondPoint.x;
    const y = firstPoint.y - secondPoint.y;
    const hypot = Math.hypot(x, y);
    return hypot;
  }


}
