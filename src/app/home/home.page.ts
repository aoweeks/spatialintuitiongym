import { Component } from '@angular/core';
import { ThreeService } from '../services/three.service'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(threeService: ThreeService) {

    console.log(threeService);
  }

}
