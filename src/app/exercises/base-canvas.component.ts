import { AfterViewInit, Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-base-canvas',
  template: ''
})
export class BaseCanvasComponent implements AfterViewInit{

  viewportSizes = {
    height: 0,
    width: 0
  };

  constructor() { }

  @HostListener('window:resize')
  onResize() {
    this.updateViewportSizes();
    this.updateCanvasSizes();
  }

  ngAfterViewInit() {
    this.updateViewportSizes();
  }

  // Get screen dimensions
  public updateViewportSizes(): void {
    this.viewportSizes.height = window.innerHeight;
    this.viewportSizes.width = window.innerWidth;
  }

  public updateCanvasSizes() { }

}
