import { Injectable } from '@angular/core';

import { PitchShifter } from 'soundtouchjs';

@Injectable({
  providedIn: 'root'
})
export class RatingFeedbackService {

  // Set up audio/SoundTouchJS
  private audioCtx = new window.AudioContext();
  private gainNode = this.audioCtx.createGain();
  private shifter: PitchShifter;

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

  // Play a sound at a particular pitch to indicate accuracy rating
  public playRatingSound() {
      this.shifter.connect(this.gainNode); // connect it to a GainNode to control the volume
      this.gainNode.connect(this.audioCtx.destination); // attach the GainNode to the 'destination' to begin playback
  }

  // Convert a colour value from decimal to hexadecimal
  private convertToHexString(decimalValue: number): string {

    let hexValue = decimalValue.toString(16);
    if( hexValue.length < 2) {
      hexValue = '0' + hexValue;
    }
    return hexValue;
  }


}
