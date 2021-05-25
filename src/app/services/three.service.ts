import { Injectable } from '@angular/core';

import * as THREE from 'Three';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  constructor() { }


  public setCanvas(canvas: HTMLElement) {
    console.log(canvas);
  }
}
