import { AfterViewInit, Component, ElementRef, Injector, ViewChild, HostListener } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon';

import { RatingFeedbackService } from '../../services/rating-feedback.service';
import { SoundsService } from 'src/app/services/sounds.service';
import { BaseCanvasComponent } from '../base-canvas.component';
import { CubeStackCanvasesService } from '../pages/cube-stack/cube-stack-canvases.service';

@Component({
  selector: 'app-base-three-renderer',
  template: '<canvas #threeCanvas></canvas>',
  styleUrls: ['./base-three-renderer.component.scss'],
})
export class BaseThreeRendererComponent extends BaseCanvasComponent implements AfterViewInit {

  @ViewChild('threeCanvas') canvasRef: ElementRef;

  baseColour = new THREE.Color(0x660066);

  orthographicCamera = false;

  physicsEnabled = false;
  physicsPaused = false;
  controlsEnabled = true;

  scene = new THREE.Scene();
  camera; //: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cameraPointLight: THREE.PointLight;
  raycaster = new THREE.Raycaster();

  world: CANNON.World;
  clock = new THREE.Clock();
  oldElapsedTime = 0;
  objectsToUpdate = [];

  private cameraAdjustments = {
    zoomFactor: 1,
    offsets: {x: 0, y: 0 }
  };


  private guiBaseParams = {
    soundOff: () => {
      this.soundsService.setSoundsEnabled('none');
    },
    soundOn: () => {
      this.soundsService.setSoundsEnabled('all');
    }
  };

  constructor(
    public ratingFeedback: RatingFeedbackService,
    public soundsService: SoundsService,
    public cubeStackCanvasesService: CubeStackCanvasesService,
    injector: Injector
  ) {
    super(injector);

    // dat.GUI tweaks
    this.debugService.gui.add(this.guiBaseParams, 'soundOff');
    this.debugService.gui.add(this.guiBaseParams, 'soundOn');
  }


  @HostListener('window:mousewheel',['$event'])
  public mouseWheel( event: WheelEvent ) {
    this.zoomCamera(event.deltaY);
  }

  @HostListener('window:keydown', ['$event'])
  public keyPress( event: KeyboardEvent ) {
    if (event.ctrlKey && event.key === 'ArrowRight') {
      this.panCamera('y', 10);
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.initialSetup();
    this.updateCanvasSizes();
  }

  public updateCanvasSizes(): void {

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

  public animate(): void {

    // TODO: Only update light on camera move
    if ( this.camera.position.x != null && this.cameraPointLight ) {
      this.cameraPointLight.position.set(
        this.camera.position.x + 2,
        this.camera.position.y + 2,
        this.camera.position.z);
      }

    // Find time elapsed since last frame
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.oldElapsedTime;
    this.oldElapsedTime = elapsedTime;

    // If physics is enabled and not paused
    if( this.physicsEnabled && !this.physicsPaused ) {
      // Update physics
      this.world.step( 1 / 60 , deltaTime, 3 );

      // Sync Three.js objects to physics objects
      for(const object of this.objectsToUpdate) {
        object.mesh.position.copy( object.body.position );
        object.mesh.quaternion.copy( object.body.quaternion );
      }
    }

    this.renderer.render(
      this.scene,
      this.camera
    );

    // Request next frame
    requestAnimationFrame( () => this.animate() );
  }


  public togglePausePhysics(pausePhysics: boolean = null) {
    if(pausePhysics === null) {
      this.physicsPaused = !this.physicsPaused;
    } else {
      this.physicsPaused = pausePhysics;
    }
  }

  // Clear scene of all physics objects
  public removeAllPhysicsObjects(): void {

    for(const object of this.objectsToUpdate) {
      this.scene.remove(object.mesh);
      object.mesh.geometry.dispose();
      object.mesh.material.dispose();

      this.world.remove(object.body);
    }
    this.objectsToUpdate = [];
  }


  // Initial Setup for Three.js scene
  private initialSetup(): void {

    this.scene.background = this.baseColour;

    // Camera setup
    if (this.orthographicCamera)
    {
      this.camera = new THREE.OrthographicCamera(1,1,1,1);
    }
    else
    {
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.viewportSizes.width / this.viewportSizes.height,
        0.1,
        50
      );
    }
    this.camera.position.set(0, 1, 3);
    this.scene.add(this.camera);

    //Lights setup
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.333 );

    const directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.castShadow = true;
    directionalLight.position.set(1, 1, 1);

    this.cameraPointLight = new THREE.PointLight( 0xffffff, 1, 100, 10 );
    this.scene.add( ambientLight, directionalLight, this.cameraPointLight );

    // Controls setup
    const controls = new OrbitControls(this.camera, this.canvasRef.nativeElement);
    controls.maxPolarAngle = (Math.PI / 2) - 0.1;


    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true
    });
    this.renderer.shadowMap.enabled = true;
    this.updateCanvasSizes();

    this.physicsInitialSetup();
  }



  // Initial Setup for Cannon.js scene
  private physicsInitialSetup(): void {

    this.world = new CANNON.World();
    this.world.gravity.set( 0, -9.82, 0 );
  }

  /**
   *  Camera Controls
   */

   private zoomCamera( delta: number ) {
    this.cameraAdjustments.zoomFactor -= ( delta / 1000 );
    this.cameraAdjustments.zoomFactor = Math.max( this.cameraAdjustments.zoomFactor, 0.5 );
    this.cameraAdjustments.zoomFactor = Math.min( this.cameraAdjustments.zoomFactor, 10 );
    console.log(this.cameraAdjustments.zoomFactor);
  }

  private panCamera( axis: string, distance: number ) {
    this.cameraAdjustments.offsets[axis] += distance;
    console.log(this.cameraAdjustments.offsets);
  }

}
