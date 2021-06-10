import { Injectable } from '@angular/core';

import * as dat from 'dat.gui';
import { SoundsService } from './sounds.service';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  gui = new dat.GUI();

  constructor() { }
}
