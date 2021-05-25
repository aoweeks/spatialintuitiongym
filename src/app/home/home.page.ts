import { Component, OnInit } from '@angular/core';
import { ThreeService } from '../services/three.service'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{


  constructor(
    private threeService: ThreeService
  ) {  }

  ngOnInit(){
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('cubeStackCanvas');
    this.threeService.setCanvas(canvas);
  }




}
