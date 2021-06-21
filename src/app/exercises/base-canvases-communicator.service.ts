import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseCanvasesCommunicatorService {

  public zoomChange = new Subject();
  public panChange = new Subject();

  private cameraSettings = {
    originalFov: 45,
    zoomFactor: 1,
    offsets: { x: 0, y: 0 }
  };



  constructor() { }

  /*
  * Camera Control Functions
  */

  public getZoom() {
    return { originalFov: this.cameraSettings.originalFov, zoomFactor: this.cameraSettings.zoomFactor };
  }

  public updateZoom( zoomIncrease: number ): void {
    let newZoomFactor = this.cameraSettings.zoomFactor -= zoomIncrease;
    newZoomFactor = Math.max( newZoomFactor, 0.5 );
    newZoomFactor = Math.min( newZoomFactor, 10 );
    this.cameraSettings.zoomFactor = newZoomFactor;

    this.zoomChange.next(newZoomFactor);
  }

  public updateOffsets(xOffset: number, yOffset: number) {
    this.cameraSettings.offsets.x += xOffset;
    this.cameraSettings.offsets.y += yOffset;

    this.panChange.next({ xOffset: this.cameraSettings.offsets.x, yOffset: this.cameraSettings.offsets.y });
  }
}
