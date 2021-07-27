import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public stopPropagation( event: any ): boolean {
    event.stopImmediatePropagation();
    event.preventDefault();
    return false;
  }
}
