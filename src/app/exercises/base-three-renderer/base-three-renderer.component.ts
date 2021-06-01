import { AfterViewInit, Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-base-three-renderer',
  templateUrl: './base-three-renderer.component.html',
  styleUrls: ['./base-three-renderer.component.scss'],
})
export class BaseThreeRendererComponent implements AfterViewInit {


  @ViewChild('threeCanvas') canvasRef: ElementRef;

  viewportSizes = {
    height: 0,
    width: 0
  };
  orthographicCamera = false;

  scene: THREE.Scene;
  camera;
  renderer: THREE.WebGLRenderer;

  constructor() {}


  @HostListener('window:resize')
  onResize() {

    this.updateViewportSizes();
    this.updateCanvasSizes();

    this.camera.aspect = this.viewportSizes.height / this.viewportSizes.width;
    console.log(this.camera);
  }

  ngAfterViewInit() {

    this.updateViewportSizes();

    this.initialSetup();
  }

  // Get screen dimensions
  private updateViewportSizes(): void {
    this.viewportSizes.height = window.innerHeight;
    this.viewportSizes.width = window.innerWidth;
  }

  private updateCanvasSizes(): void {
    this.renderer.setSize(
      this.viewportSizes.width,
      this.viewportSizes.height
    );
  }


  /**
   * Initial Setup for Three.js scene, camera, renderer
   */
  private initialSetup(): void {

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


    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement
    });
    this.updateCanvasSizes();


    this.animate();
  }

  private animate(): void {

    requestAnimationFrame(() => this.animate());

    this.camera.position.x = this.camera.position.x + 0.003;

    this.renderer.render(
      this.scene,
      this.camera
    );
  }
}
