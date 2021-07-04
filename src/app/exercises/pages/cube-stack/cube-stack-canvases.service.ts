import { Injectable } from '@angular/core';
import { BaseCanvasesCommunicatorService } from '../../base-canvases-communicator.service';

@Injectable({
  providedIn: 'root'
})
export class CubeStackCanvasesService extends BaseCanvasesCommunicatorService{

  // private cubeVisibleVertices = [];
  private cubeProjectedEdges: { start: {x: number; y: number}; end: {x: number; y: number} }[] = [];

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
  // public saveCubeVisibleVertices( cubeVisibleVertices: {x: number; y: number}[] ): void {
  //   this.cubeVisibleVertices = cubeVisibleVertices;
  // }

  // public getCubeVisibleVertices(): {x: number; y: number}[] {
  //   return this.cubeVisibleVertices;
  // }


  public saveCubeProjectedEdges( cubeProjectedEdges: { start: { x: number; y: number }; end: { x: number; y: number } }[] ): void {
    this.cubeProjectedEdges = cubeProjectedEdges;
  }

  public getCubeProjectedEdges(): { start: { x: number; y: number }; end: { x: number; y: number } }[] {
    console.log(this.cubeProjectedEdges);
    return this.cubeProjectedEdges;
  }

  public compareCubeEdges( drawnCubeEdges ): void {

    drawnCubeEdges.forEach( ( drawnEdge ) => {

      // Complete lines that start from axis indicators
      if ( drawnEdge.constraint ) {
        drawnEdge.start = this.snapPoints[0];
      }

    });
  }


}
