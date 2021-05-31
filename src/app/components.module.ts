import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseThreeRendererComponent } from './exercises/base-three-renderer/base-three-renderer.component';



@NgModule({
  declarations: [
    BaseThreeRendererComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BaseThreeRendererComponent
  ]
})
export class ComponentsModule { }
