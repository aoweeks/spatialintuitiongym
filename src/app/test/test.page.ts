import { Component, OnInit } from '@angular/core';
import { BaseExercisePage } from '../exercises/pages/base-exercise.page';

@Component({
  selector: 'app-test',
  templateUrl: '../exercises/pages/base-exercise.page.html',
  styleUrls: ['../exercises/pages/base-exercise.page.scss'],
})
export class TestPage extends BaseExercisePage implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
