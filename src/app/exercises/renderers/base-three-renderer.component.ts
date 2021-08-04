import { AfterViewInit, Component, ElementRef, Injector, ViewChild, HostListener } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon';

import { RatingFeedbackService } from '../../services/rating-feedback.service';
import { SoundsService } from 'src/app/services/sounds.service';
import { BaseCanvasComponent } from '../base-canvas.component';
import { CubeStackCanvasesService } from '../pages/cube-stack/cube-stack-canvases.service';
import { ActivatedRoute } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-base-three-renderer',
  template: '<canvas #threeCanvas></canvas>',
  styleUrls: ['./base-three-renderer.component.scss'],
})
export class BaseThreeRendererComponent extends BaseCanvasComponent implements AfterViewInit {

  @ViewChild('threeCanvas') canvasRef: ElementRef;

  baseColour = new THREE.Color(0x660066);

  physicsEnabled = false;
  physicsPaused = false;
  controlsEnabled = true;

  scene = new THREE.Scene();
  textureLoader = new THREE.TextureLoader();
  camera; //: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cameraPointLight: THREE.PointLight;
  raycaster = new THREE.Raycaster();

  world: CANNON.World;
  clock = new THREE.Clock();
  oldElapsedTime = 0;
  objectsToUpdate = [];

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
    route: ActivatedRoute,
    injector: Injector
  ) {
    super( route, injector);

    // dat.GUI tweaks
    this.debugService.gui.add(this.guiBaseParams, 'soundOff');
    this.debugService.gui.add(this.guiBaseParams, 'soundOn');
  }


  @HostListener('window:mousewheel',['$event'])
  public mouseWheel( event: WheelEvent ) {
    const zoomIncrease = (event.deltaY / 1000) * -1;
    this.cubeStackCanvasesService.updateZoom( zoomIncrease );
  }

  @HostListener('window:keydown', ['$event'])
  public keyPress( event: KeyboardEvent ) {
    if (event.ctrlKey && event.key === 'ArrowLeft') {
      this.cubeStackCanvasesService.updateOffsets( -10, 0);
    } else if (event.ctrlKey && event.key === 'ArrowRight') {
      this.cubeStackCanvasesService.updateOffsets( 10, 0);
    } else if (event.ctrlKey && event.key === 'ArrowUp') {
      this.cubeStackCanvasesService.updateOffsets( 0, -10);
    } else if (event.ctrlKey && event.key === 'ArrowDown') {
      this.cubeStackCanvasesService.updateOffsets( 0, 10);
    } else if (event.key === '+') {
      event.preventDefault();
      this.cubeStackCanvasesService.updateZoom( .1 );
    }else if (event.ctrlKey && event.key === '-') {
      event.preventDefault();
      this.cubeStackCanvasesService.updateZoom( -.1 );
    } else{
      // console.log(event);
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    this.initialSetup();
    this.updateCanvasSizes();

    this.cubeStackCanvasesService.cameraChange.subscribe( ( settings: any) => {
      this.panAndZoomCamera( settings.xOffset, settings.yOffset, settings.zoomFactor ) ;
    });

  }

  public updateCanvasSizes(): void {

    const aspectRatio = this.viewportSizes.width / this.viewportSizes.height;

    if( !this.orthographicCamera ) {
      this.camera.aspect = this.viewportSizes.width / this.viewportSizes.height;
    } else {
      this.camera.left = -1 * aspectRatio;
      this.camera.right = 1 * aspectRatio;
    }
    this.camera.updateProjectionMatrix();

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

    const aspectRatio = this.viewportSizes.width / this.viewportSizes.height;

    // Camera setup
    if ( this.orthographicCamera ) {
      this.camera = new THREE.OrthographicCamera(
        -1 * aspectRatio,
        1 * aspectRatio,
        1,
        -1,
        0.1,
        50
      );
    }
    else {
      this.camera = new THREE.PerspectiveCamera(
        75,
        aspectRatio,
        0.1,
        50
      );
    }
    this.camera.position.set(0, 13, 3);
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

  private panAndZoomCamera( xOffset: number, yOffset: number, zoomFactor: number) {

    const zoomedWidth = this.viewportSizes.width * zoomFactor;
    const zoomedHeight = this.viewportSizes.height * zoomFactor;

    const zoomedXOffset = xOffset * zoomFactor;
    const zoomedYOffset = yOffset * zoomFactor;

    // Find top-left corner of sub-render
    const leftOffset = (zoomedWidth / 2) + zoomedXOffset- (this.viewportSizes.width / 2);
    const topOffset = (zoomedHeight / 2) + zoomedYOffset - (this.viewportSizes.height / 2);

    this.camera.setViewOffset(
      zoomedWidth,
      zoomedHeight,
      leftOffset,
      topOffset,
      this.viewportSizes.width,
      this.viewportSizes.height,
    );
  }

}
