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

  public mouseMove(event: Event) {
    console.log(event);
  }

  public mouseDown(event: Event) {
    console.log('click');
  }

  public mouseUp(event: Event) {
    console.log('unclick');
  }

}
