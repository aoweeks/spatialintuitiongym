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
    // if ( rating <= .25){
    //   green = 0;
    //   red = Math.round( (1 / rating) * 510 );
    // } else if ( rating > .25 && rating < .75) {
    //   green = Math.round( (rating - .5) * 510 );
    //   red =  Math.round( (rating + .5) * 510 );
    // } else {
    //   red = 0;
    //   green = Math.round( (rating - .5) * 510 );
    // }

    // if (rating <= .25) {
    //   red = Math.round( (1 - (rating + .25)) * 340 );
    //   green = 0;
    // } else if (rating > .25 && rating < .5) {
    //   red = Math.round( (1 - (rating + .25)) * 340 );
    //   green = 255;
    // } else if (rating >= .5 && rating < .75) {
    //   red = 255;
    //   green = Math.round( (rating - .25) * 340 );
    // } else {
    //   red = 0;
    //   green = Math.round( (rating - .25) * 340 );
    // }

    if ( rating < .5 ) {
      red = Math.round( (1 - (rating + .25)) * 340 );
      green = 255 - red;
    } else if ( rating === .5 ) {
      red = 255;
      green = 255;
    } else if ( rating > .5 ) {
      green = Math.round( (rating - .25) * 340 );
      red = 255 - green;
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
