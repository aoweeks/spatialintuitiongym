import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MathsUtilsService {

  constructor() {};

  public getLineFromPoints(point1, point2) {
    const slope = (point1.y - point2.y) / (point1.x - point2.x);
    const intercept = this.calculateIntercept(slope, point1);

    let x = null;
    let y = null;

    if(slope === -Infinity) {
      x = point1.x;
    } else if (slope === 0 ) {
      y = point1.y;
    }
    const line = { slope, intercept, x, y };
    return line;
  }

  //! Need to handle horizontal and vertical lines
  public closestPointOnLine(point, line) {

    let x;
    let y;

    if(line.slope === -Infinity) {
      x = line.x;
      y = point.y;
    } else if(line.slope === 0) {
      x = point.x;
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
