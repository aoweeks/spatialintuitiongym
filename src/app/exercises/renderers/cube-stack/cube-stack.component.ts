import { Component, AfterViewInit } from '@angular/core';
import { BaseThreeRendererComponent } from '../base-three-renderer.component';

import * as CANNON from 'cannon';
import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-fatline';

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

    const worldFirstVertex = lastCube.localToWorld( firstVertex );;
    const worldVerticalVertex = lastCube.localToWorld( verticalVertex );
    const worldHorizontalVertex = lastCube.localToWorld( horizontalVertex );


    this.edgeIndicators.vertical = this.createLine(worldFirstVertex, worldVerticalVertex);
    this.edgeIndicators.horizontal = this.createLine(worldFirstVertex, worldHorizontalVertex);

    console.log(this.edgeIndicators);
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
    this.scene.add( line );
    return line;
  }

}
