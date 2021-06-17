import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CubeStackCanvasesService {

  private snapPoints = [];

  constructor() { }

  public addSnapPoint(point) {
    this.snapPoints.push(point);
  }

  public getSnapPoints() {
    return this.snapPoints;
  }

  public clearSnapPoints() {
    this.snapPoints = [];
  }
}
