import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseThreeRendererComponent } from './exercises/renderers/base-three-renderer.component';
import { CubeStackComponent } from './exercises/renderers/cube-stack/cube-stack.component';



@NgModule({
  declarations: [
    BaseThreeRendererComponent,
    CubeStackComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BaseThreeRendererComponent,
    CubeStackComponent
  ]
})
export class ComponentsModule { }
