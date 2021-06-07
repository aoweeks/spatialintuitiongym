import { Injectable } from '@angular/core';
// import { Filesystem } from '@capacitor/filesystem';

import { PitchShifter } from 'soundtouchjs';

@Injectable({
  providedIn: 'root'
})
export class RatingFeedbackService {

  // Set up audio/SoundTouchJS
  private audioContext =  new window.AudioContext(); //|| new window.webkitAudioContext() ;
  private gainNode = this.audioContext.createGain();
  private shifter: PitchShifter;


  private decodedAudio;

  constructor() {
    this.loadSoundfile();
  }

  // play =  () => {
  //   this.shifter.connect(this.gainNode); // connect it to a GainNode to control the volume
  //   this.gainNode.connect(this.audioContext.destination); // attach the GainNode to the 'destination' to begin playback
  // };

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
    // const playSound = this.audioContext.createBufferSource();
    // playSound.buffer = this.decodedAudio;

    // if ( this.shifter.timePlayed )  {
    //   this.shifter.disconnect(this.audioContext.destination);
    //   console.log('yes');
    // } else {
    this.shifter = new PitchShifter(this.audioContext, this.decodedAudio, 1024);
    this.shifter.pitch = rating * 2;
    this.shifter.connect(this.audioContext.destination);
    //   console.log('no');
    // }

    // const sine = this.audioContext.createOscillator();
    // sine.start();
    // sine.connect(this.gainNode);
    // this.gainNode.connect(this.audioContext.destination);
    // // sine.connect(this.audioContext.destination);
    // setTimeout( () => sine.stop(), 1000);

    // if ( this.shifter ) {
    //   // this.shifter.pitch = rating;
    //   this.shifter.connect(this.gainNode);
    //   this.gainNode.connect(this.audioContext.destination);
    // }
  }

  // Convert a colour value from decimal to hexadecimal
  private convertToHexString( decimalValue: number ): string {

    let hexValue = decimalValue.toString(16);
    if( hexValue.length < 2) {
      hexValue = '0' + hexValue;
    }
    return hexValue;
  }

  private loadSoundfile() {

    // Load file and convert to buffer
    // const soundFile = await fetch( 'assets/sounds/feedback-sound.mp3' );
    // console.log( soundFile );

    // const buffer = await soundFile.arrayBuffer();
    // fetch( 'assets/sounds/feedback-sound.mp3' )
    //   .then(response => response.arrayBuffer())
    //   .then(buffer => {

    //     if ( this.shifter ) {
    //       this.shifter.off(); // remove any current listeners
    //     }
    //     this.audioContext.decodeAudioData(buffer, (audioBuffer) => {

    //       // const sourceNode = this.audioContext.createBufferSource()
    //       // sourceNode.buffer = audioBuffer
    //       // sourceNode.start();

    //       this.shifter = new PitchShifter(this.audioContext, audioBuffer, 1024);
    //       this.shifter.on('play', (detail) => {
    //         // do something with detail.timePlayed;
    //         // do something with detail.formattedTimePlayed;
    //         // do something with detail.percentagePlayed
    //         console.log( 'shifter play' );
    //       });
    //       this.shifter.tempo = 1;
    //       this.shifter.pitch = 1;
    //     });
    //   });
    fetch( 'assets/sounds/beep.mp3' )
    .then(response => response.arrayBuffer())
    .then(buffer => this.audioContext.decodeAudioData(buffer))
    .then(decodedAudio => this.decodedAudio = decodedAudio);

  }

}
