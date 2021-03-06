import { Injectable } from '@angular/core';
import { PitchShifter } from 'soundtouchjs';

@Injectable({
  providedIn: 'root'
})
export class SoundsService {

  private soundsEnabled = 'none'; //'all';
  private volume = 10;

  // Set up audio/SoundTouchJS
  private audioContext =  new window.AudioContext(); //|| new window.webkitAudioContext() ;
  // private gainNode = this.audioContext.createGain();
  private shifter: PitchShifter;
  private decodedAudio;

  constructor() {
    this.loadSoundfile();
  }

  /**
   * Getters/Setters
   */

  public getVolume(): number {
    return this.volume;
  }

  public setVolume( volume: number ): void {
    this.volume = volume;
  }

  // Play a sound at a particular pitch to indicate accuracy rating
  public async playRatingSound( rating: number ) {

    if ( this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    if(this.soundsEnabled !== 'none') {
      this.shifter = new PitchShifter(this.audioContext, this.decodedAudio, 1024);
      this.shifter.pitch = rating * 2;
      this.shifter.connect(this.audioContext.destination);
    }
  }

  // Enable/disable all sounds, or feedback sounds only
  public setSoundsEnabled( setSoundsEnabledTo: string ): void {
    this.soundsEnabled = setSoundsEnabledTo;
  }

  // Load mp3, conver to buffer and save result in this.decodedAudio
  private loadSoundfile(): void {

    fetch( 'assets/sounds/beep.mp3' )
    .then(response => response.arrayBuffer())
    .then(buffer => this.audioContext.decodeAudioData(buffer))
    .then(decodedAudio => this.decodedAudio = decodedAudio);

  }
}
