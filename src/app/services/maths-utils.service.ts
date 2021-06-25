import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MathsUtilsService {

  constructor() {};

  public getLineFromPoints( point1, point2, axisIndicator = false ) {
    const slope = ( point1.y - point2.y ) / ( point1.x - point2.x );
    const intercept = this.calculateIntercept( slope, point1 );

    let x = null;
    let y = null;

    let positive = false;
    if (point1.x > point2.x) {
      positive = true;
    }
    if (slope === -Infinity) {
      x = point1.x;
      if (point1.y > point2.y) {
        positive = true;
      }
    } else if (slope === 0 ) {
      y = point1.y;
    }
    const line = { slope, intercept, x, y, positive, start: point1, axisIndicator };
    return line;
  }

  public distanceBetweenPoints( firstPoint, secondPoint ) {
    const x = firstPoint.x - secondPoint.x;
    const y = firstPoint.y - secondPoint.y;
    const hypot = Math.hypot( x, y );
    return hypot;
  }

  public closestPointOnLine( point, line ) {

    let x;
    let y;

    if( line.slope === -Infinity ) {
      x = line.x;

      if (line.positive) {
        y = point.y > line.start.y ? point.y : line.start.y;
      } else {
        y = point.y < line.start.y ? point.y : line.start.y;
      }
    } else if( line.slope === 0 ) {
      if (line.positive) {
        x = point.x > line.start.x ? point.x : line.start.x;
      } else {
        x = point.x < line.start.x ? point.x : line.start.x;
      }

      y = line.y;
    } else {

      const perpSlope = (1 / line.slope) * -1;
      const perpIntercept = this.calculateIntercept(perpSlope, point);
      const perpLine = { slope: perpSlope, intercept: perpIntercept };

      //Find x value
      const xSlopes = line.slope - perpSlope;
      const xIntercepts = perpIntercept - line.intercept;
      x = xIntercepts / xSlopes;
      y = this.yPosOnLine(line, x);

      if (line.positive) {
        if (x < line.start.x) {
          x = line.start.x;
          y = line.start.y;
        }
      } else {
        if (x > line.start.x) {
          x = line.start.x;
          y = line.start.y;
        }
      }
    }

    return {x,y};
  }

  private calculateIntercept(slope, point ): number {
    const intercept = point.y - (point.x * slope);
    return intercept;
  }

  // Return point on a given line as array, given the x value
  private yPosOnLine(line, x) {
    const y = (x * line.slope) + line.intercept;
    return y;
  }
}
