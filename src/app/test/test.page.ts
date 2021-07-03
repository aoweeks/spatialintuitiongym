import { Component, ViewChild } from '@angular/core';
import { Base2dCanvasComponent } from '../exercises/2d-canvases/base-2d-canvas.component';
import { BaseExercisePage } from '../exercises/pages/base-exercise.page';



@Component({
  selector: 'app-test',
  templateUrl: '../exercises/pages/cube-stack/cube-stack.page.html',
  styleUrls: ['../exercises/pages/base-exercise.page.scss'],
})
export class TestPage extends BaseExercisePage {

  @ViewChild('drawingCanvas')
  drawingCanvas: Base2dCanvasComponent;

  constructor() {
    super();
  }

  submitButtonClick() {
    this.drawingCanvas.submitLinesForEvalutation();
  }

}
