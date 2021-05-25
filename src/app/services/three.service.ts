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


  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;

  constructor() { }


  public setCanvas(canvas: HTMLCanvasElement) {

    this.canvas = canvas;

    // Get screen dimensions
    this.viewportSizes.height = window.innerHeight; 
    this.viewportSizes.width = window.innerWidth;
    console.log(this.viewportSizes, window.innerWidth);

  }

  
  private initialSetup() {

    // Scene setup
    this.scene = new THREE.Scene();

    // Camera setup
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
    this.scene.add(this.camera);

    // Renderer initialSetup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
    });



  }
}
