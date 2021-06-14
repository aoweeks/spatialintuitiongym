import { Component } from '@angular/core';

@Component({
  selector: 'app-base-exercise',
  templateUrl: './base-exercise.page.html',
  styleUrls: ['./base-exercise.page.scss'],
})
export class BaseExercisePage {

  public undoHistoryPresent = false;
  public redoHistoryPresent = false;

  private undoable = true;

  constructor() { }

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

}
