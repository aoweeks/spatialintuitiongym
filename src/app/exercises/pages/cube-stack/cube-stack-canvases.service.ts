import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CubeStackCanvasesService {

  private cubeVisibleVertices = [];

  private snapPoints = [];

  private zoomFactor = 1;

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

  /*
  * Camera functions
  */
  public zoomCamera( delta: number ): void {
    this.zoomFactor -= ( delta / 1000 );
    this.zoomFactor = Math.max( this.zoomFactor, 0.5 );
    this.zoomFactor = Math.min( this.zoomFactor, 10 );
    console.log(this.zoomFactor);
  }
}
