import { Injectable } from '@angular/core';
// import { Filesystem } from '@capacitor/filesystem';

import { PitchShifter } from 'soundtouchjs';

@Injectable({
  providedIn: 'root'
})
export class RatingFeedbackService {

  // Set up audio/SoundTouchJS
  private audioCtx =  new window.AudioContext(); //|| new window.webkitAudioContext() ;
  private gainNode = this.audioCtx.createGain();
  private shifter: PitchShifter;

  constructor() {
    this.loadSoundfile();
  }

  public getRatingColour( rating: number ): string {

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
  public playRatingSound( rating: number ) {
    this.audioCtx.resume();
    if ( this.shifter ) {
      console.log(this.audioCtx);
      // this.shifter.pitch = rating;
      this.shifter.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
    }
  }

  // Convert a colour value from decimal to hexadecimal
  private convertToHexString(decimalValue: number): string {

    let hexValue = decimalValue.toString(16);
    if( hexValue.length < 2) {
      hexValue = '0' + hexValue;
    }
    return hexValue;
  }

  private async loadSoundfile() {

    // Load file and convert to buffer
    const soundFile = await fetch( 'assets/sounds/feedback-sound.mp3' );
    const buffer = await soundFile.arrayBuffer();

    if ( this.shifter) {
      this.shifter.off(); // remove any current listeners
    }
    this.audioCtx.decodeAudioData(buffer, (audioBuffer) => {
      this.shifter = new PitchShifter(this.audioCtx, audioBuffer, 1024);
      this.shifter.on('play', (detail) => {
        // do something with detail.timePlayed;
        // do something with detail.formattedTimePlayed;
        // do something with detail.percentagePlayed
        console.log( 'shifter play' );
      });
      this.shifter.tempo = 1;
      this.shifter.pitch = 1;
    });
  }

}
