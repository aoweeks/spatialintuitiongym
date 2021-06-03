import { Component, AfterViewInit } from '@angular/core';
import { BaseThreeRendererComponent } from '../base-three-renderer/base-three-renderer.component';

@Component({
  selector: 'app-cube-stack',
  templateUrl: '../base-three-renderer/base-three-renderer.component.html',
  styleUrls: ['./cube-stack.component.scss'],
})
export class CubeStackComponent extends BaseThreeRendererComponent implements AfterViewInit {


  ngAfterViewInit() {}

}
