import { Injectable } from '@angular/core';

import * as THREE from 'Three';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  canvas: HTMLElement;
  scene: THREE.Scene;
  viewportSizes = {
    height: new Number,
    width: new Number
  };
  orthoganalCamera: boolean;

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

    if (this.orthoganalCamera) {

    } else {
      const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    }
  }
}
