import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Base2dCanvasComponent } from '../2d-canvases/base-2d-canvas.component';

import {
  disableBodyScroll
} from 'body-scroll-lock';
import { LocationStrategy } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';

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

  public pointSelected = false;
  public deletePoint = false;
  public deleteHovering = false;

  public snappable = true;
  private undoable = true;

  constructor(  private locationStrategy: LocationStrategy,
                private router: Router
  ) { }

  // @HostListener('window:popstate',['$event'])
  // public onPopState( event ) {
  //   console.log('back clicked!');
  //   this.preventBackNavigation();
  // }

  ngAfterViewInit() {
    disableBodyScroll( this.drawingCanvasCmp );
    // this.router.events
    //   .subscribe( ( event: NavigationStart ) => {
    //     console.log('navigation start');
    //     if ( event.navigationTrigger === 'popstate' ) {
    //       console.log('popstate');
    //       this.preventBackNavigation();
    //     }
    //   });
  }

  preventBackNavigation() {
    history.pushState(null, null, location.href);
    this.locationStrategy.onPopState( () => {
      history.pushState( null, null, location.href );
    });
  }

 /**
  * OUTPUT EVENT HANDLERS
  * TODO: Refactor these all into one
  */
  public updateUndoHistory( event: boolean ): void {
    if ( this.undoable ) {
      this.undoHistoryPresent = event;
    }
  }

  public updateRedoHistory( event: boolean ): void {
    if ( this.undoable ) {
      this.redoHistoryPresent = event;
    }
  }

  public updateCanvasIsEmpty( event: boolean ): void {
    if ( this.undoable ) {
      this.canvasIsEmpty = event;
    }
  }

  public updateSnapping( event: boolean ): void {
    this.snapping = event;
  }

  public updatePointSelectedEvent( event: boolean ): void {
    this.pointSelected = event;
  }

  /**
   * BUTTON CLICK HANDLERS
   */
  public backButtonClick(): void {
    //this.location.back();
  }

  public undoButtonClick(): void {
    this.drawingCanvasCmp.undo();
  }

  public redoButtonClick(): void {
    this.drawingCanvasCmp.redo();
  }

  public clearCanvasButtonClick(): void {
    this.drawingCanvasCmp.resetCanvas();
  }

  public snappingButtonClick(): void {
    this.drawingCanvasCmp.toggleSnapping();
  }


  /******************************* */

  public pointerEnter( event: PointerEvent ): void {
    console.log('enter');
  }
}
