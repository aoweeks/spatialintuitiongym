import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Base2dCanvasComponent } from '../exercises/2d-canvases/base-2d-canvas.component';
import { BaseExercisePage } from '../exercises/pages/base-exercise.page';
import { CubeStackCanvasesService } from '../exercises/pages/cube-stack/cube-stack-canvases.service';



@Component({
  selector: 'app-test',
  templateUrl: '../exercises/pages/cube-stack/cube-stack.page.html',
  styleUrls: ['../exercises/pages/base-exercise.page.scss'],
})
export class TestPage extends BaseExercisePage {

  @ViewChild('drawingCanvas')
  drawingCanvas: Base2dCanvasComponent;

  constructor(
    location: Location,
    private cubeStackCanvasesService: CubeStackCanvasesService
  ) {
    super( location );
  }

  submitButtonClick(): void {
    this.drawingCanvas.submitLinesForEvalutation();
  }

  nextCubeClick(): void {
    this.cubeStackCanvasesService.nextCube();
    this.drawingCanvas.answersShowing = false;
    this.drawingCanvas.resetCanvas();
    this.drawingCanvas.clearUndoHistory();
  }

}
