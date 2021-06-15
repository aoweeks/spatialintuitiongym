import { Component } from '@angular/core';

@Component({
  selector: 'app-base-exercise',
  templateUrl: './base-exercise.page.html',
  styleUrls: ['./base-exercise.page.scss'],
})
export class BaseExercisePage {

  public undoHistoryPresent = false;
  public redoHistoryPresent = false;
  public canvasIsEmpty = true;
  public snapping = true;

  public snappable = true;
  private undoable = true;

  constructor() { }

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


}
