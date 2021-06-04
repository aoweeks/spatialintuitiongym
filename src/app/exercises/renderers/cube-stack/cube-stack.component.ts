import { Component, AfterViewInit } from '@angular/core';
import { BaseThreeRendererComponent } from '../base-three-renderer.component';

import * as CANNON from 'cannon';
import * as THREE from 'three';

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

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.setUpEnvironment();
    this.animate();
  }


  public animate() {



    super.animate();
  }

  private setUpEnvironment() {

    const backgroundMaterial = new THREE.MeshBasicMaterial( {
      color: 0xffffff
    });

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
      console.log(this.scene);

    console.log(floorShape);
  }
}
