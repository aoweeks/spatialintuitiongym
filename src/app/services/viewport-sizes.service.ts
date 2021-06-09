import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewportSizesService {

  private height: number;
  private width: number;

  constructor() { }

  public getHeight(): number {
    return this.height;
  }

  public getWidth(): number {
    return this.width;
  }
}
