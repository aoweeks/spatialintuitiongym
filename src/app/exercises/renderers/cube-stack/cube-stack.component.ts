import { Component, AfterViewInit, Injector } from '@angular/core';
import { BaseThreeRendererComponent } from '../base-three-renderer.component';

import * as CANNON from 'cannon';
import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-fatline';
import { SoundsService } from 'src/app/services/sounds.service';
import { RatingFeedbackService } from 'src/app/services/rating-feedback.service';
import { MathsUtilsService } from 'src/app/services/maths-utils.service';
import { CubeStackCanvasesService } from '../../pages/cube-stack/cube-stack-canvases.service';
import { ActivatedRoute } from '@angular/router';

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
    togglePausePhysics: () => this.togglePausePhysics(),
    showCube: () => this.showCube()
  };


  private colourMap = this.textureLoader.load('/assets/textures/cube/cubecolour.png');
  private displacementMap = this.textureLoader.load('/assets/textures/cube/cubedisplacement.png');

  private backgroundMaterial = new THREE.MeshStandardMaterial( {
    color: this.baseColour
  });


  private edgeIndicatorMaterial = new LineMaterial({
    linewidth: 5,
    resolution: new THREE.Vector2(1920, 1080),
    dashed: true,
    depthTest: false,
    // dashScale: 1,
    // dashSize: 2,
    // gapSize: 2
  });

  private cubeMaterial = new THREE.MeshStandardMaterial({
    transparent: true,
    map: this.colourMap,
    // displacementMap: this.displacementMap,
    // displacementScale: -0.05,
    opacity: 0
  });

  private cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 100, 100);

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
                cubeStackCanvasesService: CubeStackCanvasesService,
                route: ActivatedRoute,
                private mathsUtilsService: MathsUtilsService,
  ) {
    super(ratingFeedbackService, soundsService, cubeStackCanvasesService, route, injector);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    this.colourMap.magFilter = THREE.NearestFilter;
    this.colourMap.minFilter = THREE.LinearMipMapLinearFilter;
    this.displacementMap.magFilter = THREE.NearestFilter;
    this.displacementMap.minFilter = THREE.LinearMipMapLinearFilter;


    //Dat.GUI tweaks
    this.debugService.gui.add(this.guiParams, 'addCube');
    this.debugService.gui.add(this.guiParams, 'clearAllCubes');
    this.debugService.gui.add(this.guiParams, 'togglePausePhysics');
    this.debugService.gui.add(this.guiParams, 'showCube' );

    this.setUpEnvironment();
    this.animate();

    this.addCube();
    this.addCube();

    this.cubeStackCanvasesService.progressStage.subscribe(
      ( stage ) => {
        switch ( stage ) {
          case 'addCube':
            this.addCube();
            break;
          case 'showCube':
            this.showCube();
            break;
        }
      }
    );
  }

  public updateCanvasSizes(): void {
    super.updateCanvasSizes();
    this.edgeIndicatorMaterial.resolution = new THREE.Vector2( this.viewportSizes.width, this.viewportSizes.height );
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
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);
  }


  private addCube(): void {

    if(this.objectsToUpdate.length){
      this.objectsToUpdate[this.objectsToUpdate.length - 1].mesh.material.transparent = false;
      this.objectsToUpdate[this.objectsToUpdate.length - 1].mesh.castShadow = true;
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

    cubeMesh.receiveShadow = true;
    cubeMesh.renderOrder = 1;
    this.scene.add(cubeMesh);


    //! this.soundsService.playRatingSound( tempRandomRating );

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



    // Edge indicators need to be placed on next frame due to Three.js
    // not updating object => world coordinates until then
    requestAnimationFrame( () =>  {
      this.addEdgeIndicator();

      //! Temp
      const cubeEdges = this.projectCubeEdges( this.objectsToUpdate[this.objectsToUpdate.length - 2]?.mesh );
      this.cubeStackCanvasesService.saveCubeProjectedEdges( cubeEdges );

      // this.cubeStackCanvasesService.saveCubeVisibleVertices(
      //   this.projectVisibleVertices( this.objectsToUpdate[this.objectsToUpdate.length - 2]?.mesh )
      // );
    } );

    this.moveCamera();
  }

  private moveCamera(): void {
    const lastCube = this.objectsToUpdate[this.objectsToUpdate.length - 1];
    this.camera.position.copy(  lastCube.mesh.position );

    const randomRadius = (Math.random() * 3) + 1;
    const cameraPositionOffset = this.mathsUtilsService.pointOnHemisphere( randomRadius, Math.PI / 2.5 );
    this.camera.position.x += cameraPositionOffset.x;
    this.camera.position.y += cameraPositionOffset.y;
    this.camera.position.z += cameraPositionOffset.z;
    this.camera.lookAt( lastCube.mesh.position );
  }

  private showCube(): void {
    this.objectsToUpdate[this.objectsToUpdate.length - 1].mesh.material.opacity = 0.5;
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
    if( Math.random() < .5 ) {
      horizontalVertex = new THREE.Vector3(horizontalLength, -.5, -.5);
    } else {
      horizontalVertex = new THREE.Vector3(-.5, -.5, horizontalLength);
    }

    // Get vertex for line starts/ends in world coordinates, and store in canvases service
    const worldFirstVertex = lastCube.localToWorld( firstVertex );
    this.addSnapPoint( worldFirstVertex.clone() );
    const worldVerticalVertex = lastCube.localToWorld( verticalVertex );
    this.addSnapPoint( worldVerticalVertex.clone(), worldFirstVertex.clone() );
    const worldHorizontalVertex = lastCube.localToWorld( horizontalVertex );
    this.addSnapPoint( worldHorizontalVertex.clone(), worldFirstVertex.clone() );


    this.edgeIndicators.vertical = this.createLine(worldFirstVertex, worldVerticalVertex);
    this.edgeIndicators.horizontal = this.createLine(worldFirstVertex, worldHorizontalVertex);
  }

  private randomLength(): number {
    return ( Math.random() * .25 ) - .4;
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
    line.castShadow = false;
    return line;
  }

  private addSnapPoint(point: THREE.Vector3, lineOriginPoint: THREE.Vector3 = null) {

    const cameraPlanePoint = point.project(this.camera);
    const convertedCameraPlanePoint = this.convertToScreenSpace(cameraPlanePoint);

    let lineConstraint = null;
    if ( lineOriginPoint ) {

      const cameraPlaneLineOriginPoint = lineOriginPoint.project(this.camera);
      const convertedCameraPlaneLineOriginPoint = this.convertToScreenSpace(cameraPlaneLineOriginPoint);
      lineConstraint = this.mathsUtilsService.getLineFromPoints(  convertedCameraPlanePoint, convertedCameraPlaneLineOriginPoint, true );
    }
    const snapPoint = {
      x: convertedCameraPlanePoint.x,
      y: convertedCameraPlanePoint.y,
      constraint: lineConstraint
    };
    this.cubeStackCanvasesService.addSnapPoint(snapPoint);
  }

  private convertToScreenSpace( point ): { x: number; y: number } {
    const zoomFactor = this.cubeStackCanvasesService.getZoom().zoomFactor;

    //! This needs fixing
    const xScaledOffset = this.cubeStackCanvasesService.getOffsets().x / zoomFactor;
    const yScaledOffset = this.cubeStackCanvasesService.getOffsets().y / zoomFactor;

    const x = ( ( point.x * ( this.viewportSizes.width / 2 ) ) / zoomFactor ) + xScaledOffset;
    const y = ( ( -point.y * ( this.viewportSizes.height / 2 ) ) / zoomFactor ) + yScaledOffset;
    return { x , y };
  }

  // private projectVisibleVertices( object: THREE.Mesh ): { x: number; y: number }[] {

  //   const positionsArray = [
  //     [.5, .5, .5], [-.5, .5, .5], [.5, -.5,.5], [-.5,-.5, -.5],
  //     [.5,.5, -.5], [.5,-.5, -.5], [-.5,.5,-.5], [-.5, -.5, .5]
  //   ];
  //   const finalPointsArray = [];

  //   // Iterate through cube, vertex positions, convert each to world space and
  //   // project onto camera plane

  //   for(const position of positionsArray) {
  //     const localPoint = new THREE.Vector3( position[0], position[1], position[2] );
  //     const worldPoint = object.localToWorld( localPoint );

  //     // const localDirection = new THREE.Vector3();
  //     // localDirection.subVectors( localPoint, this.camera.position ).normalize();
  //     // console.log(localDirection);

  //     const direction = new THREE.Vector3();
  //     direction.subVectors( worldPoint, this.camera.position ).normalize();
  //     // console.log(direction);
  //     this.raycaster.set( this.camera.position, direction);

  //     const intersectPoint = this.raycaster.intersectObject(object)[0]?.point;

  //     const distanceFromTarget = new THREE.Vector3();
  //     if (intersectPoint) {
  //       distanceFromTarget.subVectors( worldPoint, intersectPoint );
  //     };

  //     if (distanceFromTarget.length() < .01) {
  //       const projectedPoint = worldPoint.project( this.camera );
  //       const screenPoint = this.convertToScreenSpace( projectedPoint );
  //       finalPointsArray.push( screenPoint );
  //     }

  //   }
  //   return finalPointsArray;
  // }

  private projectCubeEdges( object: THREE.Mesh ): { start: {x: number; y: number}; end: {x: number; y: number} }[] {

    const convertFromWorldToScreenSpace = ( point ) => {
      const localPoint = object.localToWorld( point );
      const projectedPoint = localPoint.project( this.camera );
      const screenPoint = this.convertToScreenSpace( projectedPoint );
      return screenPoint;
    };

    const getEdgesOfFace = ( y: number ): any[] => {

      const subArrayOfProjectedEdges = [];

      const bottomLeft = convertFromWorldToScreenSpace( new THREE.Vector3( -.5, y, -.5 ) );
      const bottomRight = convertFromWorldToScreenSpace( new THREE.Vector3( .5, y, -.5 ) );
      const topLeft = convertFromWorldToScreenSpace( new THREE.Vector3( -.5, y, .5 ) );
      const topRight = convertFromWorldToScreenSpace( new THREE.Vector3( .5, y, .5 ) );

      subArrayOfProjectedEdges.push( { start: bottomLeft, end: bottomRight } );
      subArrayOfProjectedEdges.push( { start: bottomLeft, end: topLeft } );
      subArrayOfProjectedEdges.push( { start: topRight, end: bottomRight } );
      subArrayOfProjectedEdges.push( { start: topRight, end: topLeft } );

      return subArrayOfProjectedEdges;
    };

    const getVerticalEdge = ( x: number, z: number ) => {
      const start = convertFromWorldToScreenSpace( new THREE.Vector3( x, -.5, z ) );
      const end = convertFromWorldToScreenSpace( new THREE.Vector3( x, .5, z ) );

      return { start, end };
    };

    let arrayOfProjectedEdges = getEdgesOfFace( -.5 );
    arrayOfProjectedEdges = arrayOfProjectedEdges.concat( getEdgesOfFace( .5 ) );

    arrayOfProjectedEdges.push( getVerticalEdge( -.5, -.5 ) );
    arrayOfProjectedEdges.push( getVerticalEdge( -.5, .5 ) );
    arrayOfProjectedEdges.push( getVerticalEdge( .5, -.5 ) );
    arrayOfProjectedEdges.push( getVerticalEdge( .5, .5 ) );

    return arrayOfProjectedEdges;

  }
}
