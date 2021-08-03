import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPointerDetector]'
})
export class PointerDetectorDirective {

  constructor() {
    console.log('I am aaalliivve!');
  }

  @HostListener('mouseover')
  public mouseOver(): void {
    console.log('I am so over this');
  }

}
