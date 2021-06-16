import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MathsUtilsService {

  constructor() { }

  public getLineFromPoints(point1, point2) {
    const slope = (point1.x - point2.x) / (point1.y - point2.y);
    const intercept = point1.y - (point1.x * slope);

    const line = { slope, intercept };
    return line;
  }

  public closestPointOnLine(point, line) {
  /**
   * Get slope-intercept of perpendicular line by applying inverse slope to point.
   */
    const closestPoint = {x: 0, y: 0};
    return closestPoint;
  }
}
