import { Component, AfterViewInit } from '@angular/core';
import { BaseThreeRendererComponent } from '../base-three-renderer.component';

import * as CANNON from 'cannon';
import * as THREE from 'three';
import { templateJitUrl } from '@angular/compiler';

@Component({
  selector: 'app-cube-stack',
  templateUrl: '../base-three-renderer.component.html',
  styleUrls: ['./cube-stack.component.scss'],
})
export class CubeStackComponent extends BaseThreeRendererComponent implements AfterViewInit {

  physicsEnabled = true;

  // backgroundMaterial = new THREE.MeshStandardMaterial( {
  //   color: 0x000000
  // });

  guiParams = {
    addCube: () => this.addCube(),
    clearAllCubes: () => this.removeAllPhysicsObjects()
  };

  private cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000
  });
  private cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

  private cubePhysicsMaterial = new CANNON.Material('cubePhysicsMaterial');

  ngAfterViewInit() {
    super.ngAfterViewInit();

    //Dat.GUI tweaks
    this.gui.add(this.guiParams, 'addCube');
    this.gui.add(this.guiParams, 'clearAllCubes');

    this.setUpEnvironment();

    // setTimeout(  () => this.addCube(new THREE.Vector3(0, 0, 0)), 1500);
    // setTimeout(  () => this.addCube(new THREE.Vector3(0, 1, 0)), 2500);

    this.physicsEnabled = true;
    this.animate();
  }


  public animate() {



    super.animate();
  }

  private setUpEnvironment(): void {

    const backgroundMaterial = new THREE.MeshStandardMaterial();

    // Floor Plane
    // Cannon.js Plane
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    floorBody.mass = 0;
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    this.world.addBody(floorBody);

    // Three.js Plane
    const floorGeometry = new THREE.PlaneGeometry( 50, 50);
    const floorMesh = new THREE.Mesh( floorGeometry, backgroundMaterial);
    floorMesh.rotation.x = - Math.PI / 2;
    this.scene.add(floorMesh);
  }


  private addCube(): void {

    const tempRandomRating = Math.random();
    const ratingColour = this.ratingFeedback.getRatingColour(tempRandomRating);
    const previousCubeMesh = this.objectsToUpdate[this.objectsToUpdate.length - 1]?.mesh;

    //Create Three.js cube
    const cubeMesh = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial.clone());
    cubeMesh.material.color = new THREE.Color(ratingColour);
    cubeMesh.position.copy( previousCubeMesh?.position || new THREE.Vector3(0, .5, 0) );
    if(previousCubeMesh){
      cubeMesh.translateY(1.001);
    }
    cubeMesh.rotation.y = Math.random() * Math.PI * 2;
    this.scene.add(cubeMesh);

    this.ratingFeedback.playRatingSound( tempRandomRating );

    //Create Cannon.js cube, set to Three.js cube position and rotation
    const cubeShape = new CANNON.Box(new CANNON.Vec3(.5, .5, .5));
    const cubeBody = new CANNON.Body({
      mass: 1,
      shape: cubeShape
    });
    cubeBody.position.copy( cubeMesh.position as any );
    cubeBody.quaternion.copy( cubeMesh.quaternion as any );
    this.world.addBody(cubeBody);

    this.objectsToUpdate.push({
      mesh: cubeMesh,
      body: cubeBody
    });
  }



}
