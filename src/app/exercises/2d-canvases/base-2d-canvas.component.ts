import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas.component';

@Component({
  selector: 'app-base-2d-canvas',
  templateUrl: './base-2d-canvas.component.html',
  styleUrls: ['./base-2d-canvas.component.scss'],
})
export class Base2dCanvasComponent extends BaseCanvasComponent implements AfterViewInit{

  @ViewChild('2dCanvas') canvasRef: ElementRef;

  guiParams = {
    clearCanvas: () => {
      this.lines = [];
      this.context.clearRect(
        0,
        0,
        this.canvasRef.nativeElement.width,
        this.canvasRef.nativeElement.height
      );
    },
    undoLastLine: () => this.undoLastLine(),
    redoLine: () => this.redoLine()
  };

  private context;

  private mouseDownPos = { x: 0, y : 0};
  private lastCursorPos = null;

  private lines = [];
  private undoneLines = [];


  ngAfterViewInit() {
    this.context = this.canvasRef.nativeElement.getContext('2d');
    super.ngAfterViewInit();
    this.updateCanvasSizes();

    // dat.GUI tweaks
    this.debugService.gui.add(this.guiParams, 'clearCanvas');
    this.debugService.gui.add(this.guiParams, 'undoLastLine');
    this.debugService.gui.add(this.guiParams, 'redoLine');
  }

  public log(event){
    console.log(event);
  }

  public updateCanvasSizes(): void {
    this.canvasRef.nativeElement.height = this.viewportSizes.height;
    this.canvasRef.nativeElement.width = this.viewportSizes.width;
  }

  /**
   *  Mouse Event Handlers
   */

  public mouseDown( event: MouseEvent | TouchEvent ): void {

    const cursorPos = this.extractPosFromMouseOrTouchEvent( event );

    const snapPoint = this.checkForSnapPoint( cursorPos.x, cursorPos.y );

    this.mouseDownPos = snapPoint;
    this.lastCursorPos = snapPoint;
  }

  public mouseMove( event: MouseEvent | TouchEvent ): void {

    if( this.lastCursorPos ) {

      const cursorPos = this.extractPosFromMouseOrTouchEvent( event );

      this.clearCanvas();
      this.drawPreviousLines();

      // Draw current line
      this.drawLine(this.mouseDownPos, cursorPos );

      this.lastCursorPos = cursorPos;
    }
  }

  public mouseUp( event: MouseEvent | TouchEvent): void {

    const cursorPos = this.lastCursorPos || this.extractPosFromMouseOrTouchEvent( event );

    if ( this.mouseDownPos.x !== cursorPos.x
        && this.mouseDownPos.y !== cursorPos.y) {

      const snapPoint = this.checkForSnapPoint( cursorPos.x, cursorPos.y );

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

      // Clear redo history
      this.undoneLines = [];
    }

    this.clearCanvas();
    this.drawPreviousLines();

    this.lastCursorPos = false;
  }

  extractPosFromMouseOrTouchEvent(event: MouseEvent | TouchEvent) {

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

  private undoLastLine(): void {
    if ( this.lines.length ) {
      this.undoneLines.push( this.lines.pop() );
      this.clearCanvas();
      this.drawPreviousLines();
    }
  }

  private redoLine(): void {
    if ( this.undoneLines.length ) {
      this.lines.push( this.undoneLines.pop() );
      this.clearCanvas();
      this.drawPreviousLines();
    }
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

    let nearestPoint = {x: originPointX, y: originPointY};

    for ( const pointToCompare of pointsToCompare ) {
      const x = originPointX - pointToCompare.x;
      const y = originPointY - pointToCompare.y;
      const hypot = Math.hypot(x, y);
      if( hypot < radius) {
        nearestPoint = pointToCompare;
        radius = hypot;
      }
    }

    return nearestPoint;
  }

  private checkForSnapPoint(x: number, y: number) {
    const pointsArray = [];
    let nearestPoint = null;

    for ( const line of this.lines ) {
      pointsArray.push( line.start );
      pointsArray.push( line.end );
    }
    nearestPoint = this.getNearestPoint(x, y, pointsArray);

    return nearestPoint;
  }


}
