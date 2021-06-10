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
  private mouseIsDown = false;

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

  public updateCanvasSizes(): void {
    this.canvasRef.nativeElement.height = this.viewportSizes.height;
    this.canvasRef.nativeElement.width = this.viewportSizes.width;
  }

  /**
   *  Mouse Event Handlers
   */

  public mouseDown( event: MouseEvent ): void {

    const pointsArray = [];
    let nearestPoint = null;

    for ( const line of this.lines ) {
      pointsArray.push( line.start );
      pointsArray.push( line.end );
    }
    nearestPoint = this.getNearestPoint(event.clientX, event.clientY, pointsArray);

    if ( nearestPoint ){
      this.mouseDownPos.x = nearestPoint.x;
      this.mouseDownPos.y = nearestPoint.y;
    } else {
      this.mouseDownPos.x = event.clientX;
      this.mouseDownPos.y = event.clientY;
    }

    this.mouseIsDown = true;
  }

  public mouseMove( event: MouseEvent ): void {

    if( this.mouseIsDown ) {

      this.clearCanvas();
      this.drawPreviousLines();

      // Draw current line
      const currentPos = {
        x: event.clientX,
        y: event.clientY
      };
      this.drawLine(this.mouseDownPos, currentPos);
    }
  }

  public mouseUp( event: MouseEvent ): void {
    this.mouseIsDown = false;

    if ( this.mouseDownPos.x !== event.clientX
        && this.mouseDownPos.y !== event.clientY) {

      // Save line
      this.lines.push({
        start: {
          x: this.mouseDownPos.x,
          y: this.mouseDownPos.y
        },
        end: {
          x: event.clientX,
          y: event.clientY
        }
      });

      // Clear redo history
      this.undoneLines = [];
    } else {
      this.clearCanvas();
      this.drawPreviousLines();
    }
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

    let nearestPoint = null;

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

}
