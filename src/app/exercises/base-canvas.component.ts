import { AfterViewInit, Component, HostListener, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DebugService } from '../services/debug.service';


@Component({
  selector: 'app-base-canvas',
  template: ''
})
export class BaseCanvasComponent implements AfterViewInit{

  public orthographicCamera: boolean;

  viewportSizes = {
    height: 0,
    width: 0
  };

  protected debugService: DebugService;

  constructor(  private route: ActivatedRoute,
                injector: Injector ) {
    this.debugService = injector.get(DebugService);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewportSizes();
    this.updateCanvasSizes();
  }

  ngAfterViewInit() {
    if ( this.route.snapshot.paramMap.get('camera') === 'orthographic' ) {
      this.orthographicCamera = true;
    } else {
      this.orthographicCamera = false;
    }
    this.updateViewportSizes();
  }

  // Get screen dimensions
  public updateViewportSizes(): void {
    this.viewportSizes.height = window.innerHeight;
    this.viewportSizes.width = window.innerWidth;
  }

  public updateCanvasSizes() { }

}
