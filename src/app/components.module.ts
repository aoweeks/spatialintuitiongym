import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseThreeRendererComponent } from './exercises/renderers/base-three-renderer.component';
import { CubeStackComponent } from './exercises/renderers/cube-stack/cube-stack.component';
import { Base2dCanvasComponent } from './exercises/2d-canvases/base2d-canvas.component';



@NgModule({
  declarations: [
    BaseThreeRendererComponent,
    CubeStackComponent,
    Base2dCanvasComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BaseThreeRendererComponent,
    CubeStackComponent,
    Base2dCanvasComponent
  ]
})
export class ComponentsModule { }
