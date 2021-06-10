import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas.component';

@Component({
  selector: 'app-base-2d-canvas',
  templateUrl: './base-2d-canvas.component.html',
  styleUrls: ['./base-2d-canvas.component.scss'],
})
export class Base2dCanvasComponent extends BaseCanvasComponent implements AfterViewInit{

  @ViewChild('2dCanvas') canvasRef: ElementRef;
  private context;

  private mouseDownPos = { x: 0, y : 0};
  private mouseIsDown = false;

  ngAfterViewInit() {
    this.context = this.canvasRef.nativeElement.getContext('2d');
    super.ngAfterViewInit();
    this.updateCanvasSizes();
  }

  public updateCanvasSizes(): void {
    this.canvasRef.nativeElement.height = this.viewportSizes.height;
    this.canvasRef.nativeElement.width = this.viewportSizes.width;
  }

  /**
   *  Mouse Event Handlers
   */

  public mouseDown(event: MouseEvent) {
    this.context.restore();

    this.mouseDownPos.x = event.clientX;
    this.mouseDownPos.y = event.clientY;

    this.mouseIsDown = true;
  }

  public mouseMove(event: MouseEvent) {

    if(this.mouseIsDown) {

      this.context.clearRect(
        0,
        0,
        this.canvasRef.nativeElement.width,
        this.canvasRef.nativeElement.height
      );
      this.context.beginPath();

      this.context.lineWidth = 5;

      this.context.moveTo(this.mouseDownPos.x, this.mouseDownPos.y);
      this.context.lineTo(event.clientX, event.clientY);
      this.context.stroke();
    }
  }

  public mouseUp(event: MouseEvent) {
    this.mouseIsDown = false;
    this.context.save();
  }

}
