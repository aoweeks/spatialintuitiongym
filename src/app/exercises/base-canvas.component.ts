import { AfterViewInit, Component, HostListener, Injector } from '@angular/core';
import { DebugService } from '../services/debug.service';


@Component({
  selector: 'app-base-canvas',
  template: ''
})
export class BaseCanvasComponent implements AfterViewInit{

  viewportSizes = {
    height: 0,
    width: 0
  };

  protected debugService: DebugService;

  constructor(injector: Injector) {
    this.debugService = injector.get(DebugService);
  }

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
