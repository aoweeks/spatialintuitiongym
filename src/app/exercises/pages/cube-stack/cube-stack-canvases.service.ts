import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CubeStackCanvasesService {

  private cubeVisibleVertices = [];

  private snapPoints = [];

  private cameraAdjustments = {
    zoomFactor: 1,
    offsets: {x: 0, y: 0 }
  };

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
    this.cameraAdjustments.zoomFactor -= ( delta / 1000 );
    this.cameraAdjustments.zoomFactor = Math.max( this.cameraAdjustments.zoomFactor, 0.5 );
    this.cameraAdjustments.zoomFactor = Math.min( this.cameraAdjustments.zoomFactor, 10 );
    console.log(this.cameraAdjustments.zoomFactor);
  }

  public panCamera( axis: string, distance: number ): void {
    this.cameraAdjustments.offsets[axis] += distance;
    console.log(this.cameraAdjustments.offsets);
  }
}
