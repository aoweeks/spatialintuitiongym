import { Component, AfterViewInit, Injector } from '@angular/core';
import { BaseThreeRendererComponent } from '../base-three-renderer.component';

import * as CANNON from 'cannon';
import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-fatline';
import { SoundsService } from 'src/app/services/sounds.service';
import { RatingFeedbackService } from 'src/app/services/rating-feedback.service';
import { MathsUtilsService } from 'src/app/services/maths-utils.service';
import { CubeStackCanvasesService } from '../../pages/cube-stack/cube-stack-canvases.service';

@Component({
  selector: 'app-cube-stack',
  template: '<canvas #threeCanvas></canvas>',
  styleUrls: ['../base-three-renderer.component.scss'],
})
export class CubeStackComponent extends BaseThreeRendererComponent implements AfterViewInit {

  physicsEnabled = true;
  physicsPaused = true;

    guiParams = {
      addCube: () => this.addCube(),
      clearAllCubes: () => this.removeAllPhysicsObjects(),
      togglePausePhysics: () => this.togglePausePhysics()
    };

  private backgroundMaterial = new THREE.MeshStandardMaterial( {
    color: this.baseColour
  });


  private edgeIndicatorMaterial = new LineMaterial({
    linewidth: 5,
    resolution: new THREE.Vector2(1920, 1080),
    dashed: true,
    depthTest: false
    // dashScale: 1,
    // dashSize: 2,
    // gapSize: 2
  });
  private cubeMaterial = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0
  });
  private cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);

  private cubePhysicsMaterial = new CANNON.Material('cubePhysicsMaterial');
  private cubesContactMaterial = new CANNON.ContactMaterial(
    this.cubePhysicsMaterial,
    this.cubePhysicsMaterial,
    {
      friction: 5,
      restitution: 0
    }
  );
  private backgroundPhysicsMaterial = new CANNON.Material('backgroundPhysicsMaterial');
  private backgroundCubeContactMaterial = new CANNON.ContactMaterial(
    this.backgroundPhysicsMaterial,
    this.cubePhysicsMaterial,
    {
      friction: 1,
      restitution: 0
    }
  );

  private edgeIndicators = { vertical: null, horizontal: null};

  constructor(  injector: Injector,
                soundsService: SoundsService,
                ratingFeedbackService: RatingFeedbackService,
                private mathsUtilsService: MathsUtilsService,
                private cubeStackCanvasesService: CubeStackCanvasesService
  ) {
    super(ratingFeedbackService, soundsService, injector);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    //Dat.GUI tweaks
    this.debugService.gui.add(this.guiParams, 'addCube');
    this.debugService.gui.add(this.guiParams, 'clearAllCubes');
    this.debugService.gui.add(this.guiParams, 'togglePausePhysics');

    this.setUpEnvironment();
    this.animate();
  }

  public updateCanvasSizes(): void {
    super.updateCanvasSizes();
    this.edgeIndicatorMaterial.resolution = new THREE.Vector2(this.viewportSizes.width, this.viewportSizes.height);
  }

  // public animate() {
  //   super.animate();
  // }

  private setUpEnvironment(): void {

    this.world.addContactMaterial(this.cubesContactMaterial);
    this.world.addContactMaterial(this.backgroundCubeContactMaterial);

    // Floor Plane
    // Cannon.js Plane
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({
      mass: 0,
      material: this.backgroundPhysicsMaterial,
      shape: floorShape
    });
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    this.world.addBody(floorBody);

    // Three.js Plane
    const floorGeometry = new THREE.PlaneGeometry( 50, 50);
    const floorMesh = new THREE.Mesh( floorGeometry, this.backgroundMaterial);
    floorMesh.rotation.x = - Math.PI / 2;
    this.scene.add(floorMesh);
  }


  private addCube(): void {

    //! Temp test code
    if(this.objectsToUpdate.length){
      this.objectsToUpdate[this.objectsToUpdate.length - 1].mesh.material.transparent = false;
    }

    const tempRandomRating = Math.random();
    const ratingColour = this.ratingFeedback.getRatingColour(tempRandomRating);
    const previousCubeMesh = this.objectsToUpdate[this.objectsToUpdate.length - 1]?.mesh;

    //Create Three.js cube
    const cubeMesh = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial.clone());
    cubeMesh.material.color = new THREE.Color(ratingColour);
    cubeMesh.position.copy( previousCubeMesh?.position || new THREE.Vector3(0, .5, 0) );
    if(previousCubeMesh){
      cubeMesh.translateY(1);
    }
    cubeMesh.rotation.y = Math.random() * Math.PI * 2;

    // /cubeMesh.castShadow = true;
    cubeMesh.receiveShadow = true;
    cubeMesh.renderOrder = 1;
    this.scene.add(cubeMesh);


    this.soundsService.playRatingSound( tempRandomRating );

    // Create Cannon.js cube, set to Three.js cube position and rotation
    const cubeShape = new CANNON.Box(new CANNON.Vec3(.5, .5, .5));
    const cubeBody = new CANNON.Body({
      mass: 1,
      shape: cubeShape,
      material: this.cubePhysicsMaterial
    });
    cubeBody.position.copy( cubeMesh.position as any );
    cubeBody.quaternion.copy( cubeMesh.quaternion as any );
    this.world.addBody(cubeBody);

    this.objectsToUpdate.push({
      mesh: cubeMesh,
      body: cubeBody
    });

    this.cubeStackCanvasesService.saveCubeVisibleVertices( this.projectVisibleVertices( cubeMesh) );

    // Edge indicators need to be placed on next frame due to Three.js
    // not updating object => world coordinates until then
    requestAnimationFrame( () => this.addEdgeIndicator() );

    this.moveCamera();
  }

  private moveCamera(): void {
    const lastCube = this.objectsToUpdate[this.objectsToUpdate.length - 1];
    this.camera.position.y = lastCube.mesh.position.y;
    this.camera.lookAt(lastCube.mesh.position);
  }

  private addEdgeIndicator(): void {

    // Clear previous edge indicators
    this.cubeStackCanvasesService.clearSnapPoints();
    if( this.edgeIndicators.horizontal !== null) {
      this.scene.remove(this.edgeIndicators.horizontal, this.edgeIndicators.vertical );
    }

    const lastCube = this.objectsToUpdate[this.objectsToUpdate.length - 1].mesh;

    const firstVertex = new THREE.Vector3(-.5, -.5, -.5);

    const verticalLength = this.randomLength();
    const verticalVertex = new THREE.Vector3(-.5, verticalLength, -.5);

    const horizontalLength = this.randomLength();
    let horizontalVertex = new THREE.Vector3();

    // 50/50 chance of line being on the X or Z axes
    if( Math.random() < .5) {
      horizontalVertex = new THREE.Vector3(horizontalLength, -.5, -.5);
    } else {
      horizontalVertex = new THREE.Vector3(-.5, -.5, horizontalLength);
    }

    // Get vertex for line starts/ends in world coordinates, and store in canvases service
    const worldFirstVertex = lastCube.localToWorld( firstVertex );
    this.addSnapPoint(worldFirstVertex.clone());
    const worldVerticalVertex = lastCube.localToWorld( verticalVertex );
    this.addSnapPoint(worldVerticalVertex.clone(), worldFirstVertex.clone());
    const worldHorizontalVertex = lastCube.localToWorld( horizontalVertex );
    this.addSnapPoint(worldHorizontalVertex.clone(), worldFirstVertex.clone());


    this.edgeIndicators.vertical = this.createLine(worldFirstVertex, worldVerticalVertex);
    this.edgeIndicators.horizontal = this.createLine(worldFirstVertex, worldHorizontalVertex);
  }

  private randomLength(): number {
    return (Math.random() * .25) - .4;
  }

  private createLine(start: THREE.Vector3, end: THREE.Vector3): Line2 {

    const lineGeometry = new LineGeometry();
    lineGeometry.setPositions([
      start.x, start.y, start.z,
      end.x, end.y, end.z
    ]);

    // const line = new THREE.Line( lineGeometry, this.edgeIndicatorMaterial );
    const line = new Line2( lineGeometry, this.edgeIndicatorMaterial );
    line.renderOrder = 2;
    this.scene.add( line );
    return line;
  }

  private addSnapPoint(point: THREE.Vector3, lineOriginPoint: THREE.Vector3 = null) {

    const cameraPlanePoint = point.project(this.camera);
    const convertedCameraPlanePoint = this.convertToScreenSpace(cameraPlanePoint);

    let lineConstraint = null;
    if (lineOriginPoint) {

      const cameraPlaneLineOriginPoint = lineOriginPoint.project(this.camera);
      const convertedCameraPlaneLineOriginPoint = this.convertToScreenSpace(cameraPlaneLineOriginPoint);
      lineConstraint = this.mathsUtilsService.getLineFromPoints(  convertedCameraPlanePoint, convertedCameraPlaneLineOriginPoint );
    }
    const snapPoint = {
      x: convertedCameraPlanePoint.x,
      y: convertedCameraPlanePoint.y,
      constraint: lineConstraint
    };
    this.cubeStackCanvasesService.addSnapPoint(snapPoint);
  }

  private convertToScreenSpace(point): {x: number; y: number} {
    const x = ( point.x + 1) * this.viewportSizes.width / 2;
    const y = - ( point.y - 1) * this.viewportSizes.height / 2;
    return {x , y};
  }

  private projectVisibleVertices(object: THREE.Mesh): {x: number; y: number}[] {
    const finalPointsArray = [];

    console.log(object.geometry.getAttribute( 'position' ).array);
    return finalPointsArray;
  }
}
