import { Injectable } from '@angular/core';
// import { Filesystem } from '@capacitor/filesystem';

import { PitchShifter } from 'soundtouchjs';

@Injectable({
  providedIn: 'root'
})
export class RatingFeedbackService {

  // Set up audio/SoundTouchJS
  private audioContext =  new window.AudioContext(); //|| new window.webkitAudioContext() ;
  // private gainNode = this.audioContext.createGain();
  private shifter: PitchShifter;


  private decodedAudio;

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
    const rgbHex = '#' + redHex + greenHex + '00';

    return rgbHex;
  }

  // Play a sound at a particular pitch to indicate accuracy rating
  public async playRatingSound( rating: number ) {

    if ( this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.shifter = new PitchShifter(this.audioContext, this.decodedAudio, 1024);
    this.shifter.pitch = rating * 2;
    this.shifter.connect(this.audioContext.destination);

  }

  // Convert a colour value from decimal to hexadecimal
  private convertToHexString( decimalValue: number ): string {

    let hexValue = decimalValue.toString(16);
    if( hexValue.length < 2) {
      hexValue = '0' + hexValue;
    }
    return hexValue;
  }


  // Load mp3, conver to buffer and save result in this.decodedAudio
  private loadSoundfile() {

    fetch( 'assets/sounds/beep.mp3' )
    .then(response => response.arrayBuffer())
    .then(buffer => this.audioContext.decodeAudioData(buffer))
    .then(decodedAudio => this.decodedAudio = decodedAudio);

  }

}
