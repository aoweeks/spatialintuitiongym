import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MathsUtilsService {

  constructor() { }

  public getLineFromPoints(point1, point2) {
    const slope = (point1.x - point2.x) / (point1.y - point2.y);
    const intercept = this.calculateIntercept(slope, point1);

    const line = { slope, intercept };
    return line;
  }

  //! Need to handle horizontal and vertical lines
  public closestPointOnLine(point, line) {


    const perpSlope = (1 / line.slope) * -1;
    const perpIntercept = this.calculateIntercept(perpSlope, point);
    const perpLine = { slope: perpSlope, intercept: perpIntercept };

    //Find x value
    const xSlopes = line.slope - perpSlope;
    const xIntercepts = perpIntercept - line.intercept;
    const x = xIntercepts / xSlopes;

    const y = this.yPosOnLine(line, x);

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
