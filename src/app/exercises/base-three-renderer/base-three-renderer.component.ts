import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base-three-renderer',
  templateUrl: './base-three-renderer.component.html',
  styleUrls: ['./base-three-renderer.component.scss'],
})
export class BaseThreeRendererComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('renderer initialised');
  }

}
