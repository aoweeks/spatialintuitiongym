import { Injectable } from '@angular/core';
import { BaseCanvasesCommunicatorService } from '../../base-canvases-communicator.service';

@Injectable({
  providedIn: 'root'
})
export class CubeStackCanvasesService extends BaseCanvasesCommunicatorService{

  private cubeVisibleVertices = [];

  private snapPoints = [];
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
