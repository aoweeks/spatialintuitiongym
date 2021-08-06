import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseThreeRendererComponent } from './exercises/renderers/base-three-renderer.component';
import { CubeStackComponent } from './exercises/renderers/cube-stack/cube-stack.component';
import { Base2dCanvasComponent } from './exercises/2d-canvases/base-2d-canvas.component';
import { DirectivesModule } from './directives/directives.module';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    BaseThreeRendererComponent,
    CubeStackComponent,
    Base2dCanvasComponent
  ],
  imports: [
    CommonModule,
    DirectivesModule,
    IonicModule
  ],
  exports: [
    BaseThreeRendererComponent,
    CubeStackComponent,
    Base2dCanvasComponent
  ]
})
export class ComponentsModule { }
