import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PointerDetectorDirective } from './pointer-detector.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [PointerDetectorDirective],
  exports: [PointerDetectorDirective]
})
export class DirectivesModule { }
