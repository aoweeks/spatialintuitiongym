import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseExercisePage } from '../base-exercise.page';

@Component({
  selector: 'app-cube-stack',
  template: '',
  styleUrls: ['./cube-stack.page.scss'],
})
export class CubeStackPage extends BaseExercisePage implements OnInit {

  constructor(  locationStrategy: LocationStrategy,
                router: Router
  ) {
    super(locationStrategy, router);
  }

  ngOnInit() {
  }

  submitButtonClick() {

  }

  nextCubeClick() {

  }

  deleteButtonClick() {

  }

  /**
   * MOUSE ENTER/LEAVE HANDLERS
   */
   public mouseOverDelete( hovering: boolean ): void {
    this.deleteHovering = hovering;
  }

}
