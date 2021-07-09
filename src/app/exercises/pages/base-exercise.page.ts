import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Base2dCanvasComponent } from '../2d-canvases/base-2d-canvas.component';

import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks
} from 'body-scroll-lock';
import { Location } from '@angular/common';

@Component({
  selector: 'app-base-exercise',
  templateUrl: './base-exercise.page.html',
  styleUrls: ['./base-exercise.page.scss'],
})
export class BaseExercisePage implements AfterViewInit{

  @ViewChild('drawingCanvas') drawingCanvasCmp: Base2dCanvasComponent;

  public undoHistoryPresent = false;
  public redoHistoryPresent = false;
  public canvasIsEmpty = true;
  public snapping = true;

  public snappable = true;
  private undoable = true;

  constructor( private location: Location ) { }

  ngAfterViewInit() {
    disableBodyScroll(this.drawingCanvasCmp);
  }

 /**
  * OUTPUT EVENT HANDLERS
  * TODO: Refactor these all into one
  */
  public updateUndoHistory(event: boolean) {
    if(this.undoable) {
      this.undoHistoryPresent = event;
    }
  }

  public updateRedoHistory(event: boolean) {
    if(this.undoable) {
      this.redoHistoryPresent = event;
    }
  }

  public updateCanvasIsEmpty(event: boolean) {
    if(this.undoable) {
      this.canvasIsEmpty = event;
    }
  }

  public updateSnapping(event: boolean) {
    this.snapping = event;
  }

  /**
   * BUTTON CLICK HANDLERS
   */
  backButtonClick() {
    this.location.back();
  }

  undoButtonClick() {
    this.drawingCanvasCmp.undo();
  }

  redoButtonClick() {
    this.drawingCanvasCmp.redo();
  }

  clearCanvasButtonClick() {
    this.drawingCanvasCmp.resetCanvas();
  }

  snappingButtonClick() {
    this.drawingCanvasCmp.toggleSnapping();
  }
}
