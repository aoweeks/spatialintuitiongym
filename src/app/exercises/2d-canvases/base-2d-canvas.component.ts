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
    }
  };

  private context;

  private mouseDownPos = { x: 0, y : 0};
  private mouseIsDown = false;

  private lines = [];


  ngAfterViewInit() {
    this.context = this.canvasRef.nativeElement.getContext('2d');
    super.ngAfterViewInit();
    this.updateCanvasSizes();

    this.debugService.gui.add(this.guiParams, 'clearCanvas');
  }

  public updateCanvasSizes(): void {
    this.canvasRef.nativeElement.height = this.viewportSizes.height;
    this.canvasRef.nativeElement.width = this.viewportSizes.width;
  }

  /**
   *  Mouse Event Handlers
   */

  public mouseDown( event: MouseEvent ): void {

    this.mouseDownPos.x = event.clientX;
    this.mouseDownPos.y = event.clientY;

    this.mouseIsDown = true;
  }

  public mouseMove( event: MouseEvent ): void {

    if( this.mouseIsDown ) {

      //Clear canvas
      this.context.clearRect(
        0,
        0,
        this.canvasRef.nativeElement.width,
        this.canvasRef.nativeElement.height
      );

      // Redraw previous lines
      for(const line of this.lines) {
        this.drawLine(line.start, line.end);
      }

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
  }

  drawLine(
    start: any,
    end: any
  ): void {
    this.context.beginPath();

    this.context.lineWidth = 5;

    this.context.moveTo(start.x, start.y);
    this.context.lineTo(end.x, end.y);
    this.context.stroke();
  }

}
