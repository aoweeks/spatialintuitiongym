import { Injectable } from '@angular/core';

import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {
 
  viewportSizes = {
    height: new Number,
    width: new Number
  };
  orthographicCamera: boolean;


  canvas: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.Camera;

  constructor() { }


  public setCanvas(canvas: HTMLElement) {

    this.canvas = canvas;

    // Get screen dimensions
    this.viewportSizes.height = window.innerHeight; 
    this.viewportSizes.width = window.innerWidth;
    console.log(this.viewportSizes, window.innerWidth);
    
  }

  
  private initialSetup() {

    /**
     * Scene Setup
     */

    this.scene = new THREE.Scene();

    if (this.orthographicCamera)
    {
      this.camera = new THREE.OrthographicCamera(1,1,1,1);
    }
    else
    {
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
    }
  }
}
