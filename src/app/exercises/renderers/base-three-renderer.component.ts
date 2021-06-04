import { AfterViewInit, Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';
import CANNON from 'cannon';


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
  physicsEnabled = false;

  scene = new THREE.Scene();
  camera; //: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  world: CANNON.World;
  clock = new THREE.Clock();


  constructor() {
  }


  @HostListener('window:resize')
  onResize() {

    this.updateViewportSizes();
    this.updateCanvasSizes();

    console.log(this.camera);
  }

  ngAfterViewInit() {

    this.updateViewportSizes();

    this.initialSetup();
  }

  public animate(): void {

    requestAnimationFrame(() => this.animate());

    this.camera.position.x = this.camera.position.x + 0.003;

    this.renderer.render(
      this.scene,
      this.camera
    );
  }

  // Get screen dimensions
  private updateViewportSizes(): void {
    this.viewportSizes.height = window.innerHeight;
    this.viewportSizes.width = window.innerWidth;
  }

  private updateCanvasSizes(): void {

    if(!this.orthographicCamera) {
      this.camera.aspect = this.viewportSizes.width / this.viewportSizes.height;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.setSize(
      this.viewportSizes.width,
      this.viewportSizes.height
    );
  }


  /**
   * Initial Setup for Three.js scene, camera, renderer
   */
  private initialSetup(): void {

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
    this.camera.position.set(0, 1, 3);
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

    this.physicsInitialSetup();
  }



  private physicsInitialSetup(): void {

    this.world = new CANNON.World();
    this.world.gravity.set( 0, -9.82, 0 );
  }
}
