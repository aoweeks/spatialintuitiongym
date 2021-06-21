import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseCanvasesCommunicatorService {

  private cameraSettings = {
    originalFov: 45,
    zoomFactor: 1,
    offsets: { x: 0, y: 0 }
  };


  constructor() { }

  /*
  * Camera Control Functions
  */
}
