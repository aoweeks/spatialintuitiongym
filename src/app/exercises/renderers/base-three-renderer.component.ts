import { AfterViewInit, Component, ElementRef, ViewChild, HostListener } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import CANNON from 'cannon';

import { RatingFeedbackService } from '../../services/rating-feedback.service';


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
  controlsEnabled = true;

  scene = new THREE.Scene();
  camera; //: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cameraPointLight: THREE.PointLight;

  world: CANNON.World;
  clock = new THREE.Clock();


  constructor(
    public ratingFeedback: RatingFeedbackService
  ) {}


  @HostListener('window:resize')
  onResize() {

    this.updateViewportSizes();
    this.updateCanvasSizes();

  }

  ngAfterViewInit() {

    this.updateViewportSizes();

    this.initialSetup();
  }

  public animate(): void {

    requestAnimationFrame(() => this.animate());

    /**
     * TODO: Only update light on camera move
     */
    if ( this.camera.position.x != null && this.cameraPointLight ) {
      this.cameraPointLight.position.set(
        this.camera.position.x + 2,
        this.camera.position.y + 2,
        this.camera.position.z);
    }
    // console.log(this.camera);

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

    this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
  }


  /**
   * Initial Setup for Three.js scene
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

    //Lights setup
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.333 );

    const directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set(1, 1, 1);

    this.cameraPointLight = new THREE.PointLight( 0xffffff, 1, 100, 10 );
    this.scene.add( ambientLight, directionalLight, this.cameraPointLight );

    // Controls setup
    const controls = new OrbitControls(this.camera, this.canvasRef.nativeElement);
    controls.maxPolarAngle = (Math.PI / 2) - 0.1;


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
