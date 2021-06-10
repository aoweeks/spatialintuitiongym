import { Injectable } from '@angular/core';

import * as dat from 'dat.gui';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  gui = new dat.GUI();

  constructor() { }
}
