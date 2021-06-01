import { Injectable } from '@angular/core';

import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  viewportSizes = {
    height: 0,
    width: 0
  };
  orthographicCamera = true;


  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;

  constructor() { }


  public setCanvas(canvas: HTMLCanvasElement) {

    this.canvas = canvas;

    // Get screen dimensions
    this.viewportSizes.height = 600; //window.innerHeight;
    this.viewportSizes.width = 800; //window.innerWidth;
    console.log(this.viewportSizes, window.innerWidth);

    this.initialSetup();

  }



  /**
   * Initial Setup for Three.js scene, camera, renderer
   */


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
        this.viewportSizes.width / this.viewportSizes.height
        // 0.1,
        // 1000
      );
    }
    this.camera.position.z = 3;
    this.scene.add(this.camera);


    // Test Cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({
        color: '#ff0000'
    });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.scene.add(cubeMesh);
    console.log(cubeMesh);




    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
    });
    this.renderer.setSize(
      this.viewportSizes.width,
      this.viewportSizes.height
    );
    this.renderer.render(
      this.scene,
      this.camera
    );

    this.camera.lookAt(cubeMesh.position);

    console.log(cubeMesh.position, this.camera.position);


  }
}
