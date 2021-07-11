import { Injectable } from '@angular/core';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {

  private exercisesList = [];


  constructor() {

    exercisesList.push( new Exercise( 0, 'cube' ) );
  }
}
