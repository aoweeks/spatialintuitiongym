import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MathsUtilsService } from 'src/app/services/maths-utils.service';
import { BaseCanvasesCommunicatorService } from '../../base-canvases-communicator.service';

@Injectable({
  providedIn: 'root'
})
export class CubeStackCanvasesService extends BaseCanvasesCommunicatorService{

  public progressStage = new Subject();

  // private cubeVisibleVertices = [];
  private cubeProjectedEdges: { start: {x: number; y: number}; end: {x: number; y: number} }[] = [];

  private snapPoints = [];

  constructor( private mathsUtilsService: MathsUtilsService ) {
    super();
  }


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

    let totalScore = 0;

    drawnCubeEdges.forEach( ( drawnEdge ) => {

      // Complete lines that start from axis indicators
      if ( drawnEdge.constraint ) {
        drawnEdge.start = this.snapPoints[0];
      }

      let closestMatch = 1000000;

      this.cubeProjectedEdges.forEach( ( projectedEdge ) => {

        // console.log( projectedEdge.start, drawnEdge.start, projectedEdge.end, drawnEdge.end);

        const startToStartDistance = this.mathsUtilsService.distanceBetweenPoints( projectedEdge.start, drawnEdge.start );
        const endToStartDistance = this.mathsUtilsService.distanceBetweenPoints( projectedEdge.end, drawnEdge.start );
        const startToEndDistance = this.mathsUtilsService.distanceBetweenPoints( projectedEdge.start, drawnEdge.end );
        const endToEndDistance = this.mathsUtilsService.distanceBetweenPoints( projectedEdge.end, drawnEdge.end );

        let tempClosestMatch;
        if ( ( startToStartDistance + endToEndDistance ) <= ( startToEndDistance + endToStartDistance ) ) {
          tempClosestMatch = ( startToStartDistance + endToEndDistance );
        } else {
          tempClosestMatch = ( startToEndDistance + endToStartDistance );
        }

        if ( tempClosestMatch < closestMatch ) {
          closestMatch = tempClosestMatch;
        }
      });
      console.log(closestMatch);
      totalScore += closestMatch;
    });

    console.log( totalScore );

    this.progressStage.next( 'addCube' );
  }
}
