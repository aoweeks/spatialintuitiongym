import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseCanvasesCommunicatorService {

  static minZoomFactor = .5;
  static maxZoomFactor = 10;

  public cameraChange = new Subject();

  private cameraSettings = {
    originalFov: 45,
    zoomFactor: 1,
    tempZoomScale: 1, // the amount currently being scaled by pinching
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
    let newZoomFactor = this.cameraSettings.zoomFactor += zoomIncrease;
    newZoomFactor = Math.max( newZoomFactor, BaseCanvasesCommunicatorService.minZoomFactor );
    newZoomFactor = Math.min( newZoomFactor, BaseCanvasesCommunicatorService.maxZoomFactor );
    this.cameraSettings.zoomFactor = newZoomFactor;

    this.broadcastCameraSettings();
  }

  public scaleZoom( scale: number ) {
    this.cameraSettings.tempZoomScale = scale;
    this.broadcastCameraSettings();
  }

  public bakeScaleZoom( scale ): void {
    let newZoomFactor = this.cameraSettings.zoomFactor * scale;
    newZoomFactor = Math.max( newZoomFactor, BaseCanvasesCommunicatorService.minZoomFactor );
    newZoomFactor = Math.min( newZoomFactor, BaseCanvasesCommunicatorService.maxZoomFactor );

    this.cameraSettings.zoomFactor = newZoomFactor;
    this.cameraSettings.tempZoomScale = 1;

    this.broadcastCameraSettings();
  }

  public updateOffsets(xOffset: number, yOffset: number): void {

    this.cameraSettings.offsets.x += xOffset;
    this.cameraSettings.offsets.y += yOffset;

    this.broadcastCameraSettings();
  }

  public setOffsets( xOffset: number, yOffset: number ): void {

    this.cameraSettings.offsets.x = xOffset;
    this.cameraSettings.offsets.y = yOffset;

    this.broadcastCameraSettings();
  }

  public getOffsets(): { x: number; y: number } {
    return this.cameraSettings.offsets;
  }

  private broadcastCameraSettings(): void {
    const zoom = this.cameraSettings.zoomFactor * this.cameraSettings.tempZoomScale;
    this.cameraChange.next({
      xOffset: this.cameraSettings.offsets.x,
      yOffset: this.cameraSettings.offsets.y,
      zoomFactor: zoom
    });
  }
}
