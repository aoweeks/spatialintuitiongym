import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BaseExercisePage } from '../base-exercise.page';

@Component({
  selector: 'app-cube-stack',
  templateUrl: './cube-stack.page.html',
  styleUrls: ['./cube-stack.page.scss'],
})
export class CubeStackPage extends BaseExercisePage implements OnInit {

  constructor( location: Location) {
    super(location);
  }

  ngOnInit() {
  }

  submitButtonClick() {

  }

  nextCubeClick() {

  }
}
