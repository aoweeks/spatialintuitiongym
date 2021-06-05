import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RatingFeedbackService {

  constructor() {
    console.log('colour');
  }

  public getRatingColour(rating: number): string {

    let red: number;
    let green: number;

    // Calculate proportion of Red/Green in feedback colour
    if ( rating < .5 ) {
      red = 255;
      green =  Math.round( rating * 510 );
    } else if ( rating > .5 ) {
      red = Math.round( (1 - rating) * 510 );
      green = 255;
    } else {
      green = 255;
      red = 255;
    }

    const redHex = this.convertToHexString(red);
    const greenHex = this.convertToHexString(green);


    console.log(red, green, redHex, greenHex);
    const rgbHex = '#' + redHex + greenHex + '00';

    return rgbHex;
  }


  private convertToHexString(decimalValue: number): string {

    let hexValue = decimalValue.toString(16);
    if( hexValue.length < 2) {
      hexValue = '0' + hexValue;
    }
    return hexValue;
  }
}
