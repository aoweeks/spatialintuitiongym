import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CubeStackCanvasesService {

  private cubeVisibleVertices = [];

  private snapPoints = [];

  constructor() { }

  /*
  *Edge indicator snap point functions
  */
  public addSnapPoint(point): void {
    this.snapPoints.push(point);
  }

  public getSnapPoints(): any[] {
    return this.snapPoints;
  }

  public clearSnapPoints(): void {
    this.snapPoints = [];
  }

  /*
  * Vertex comparison Functions
  */
  public saveCubeVisibleVertices( cubeVisibleVertices: {x: number; y: number}[] ): void {
    this.cubeVisibleVertices = cubeVisibleVertices;
  }

  public getCubeVisibleVertices(): {x: number; y: number}[] {
    return this.cubeVisibleVertices;
  }
}
