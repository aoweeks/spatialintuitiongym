import { Component, OnInit } from '@angular/core';
import { SoundsService } from 'src/app/services/sounds.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: [
    './settings.page.scss',
    '../../../shared.scss'
  ]
})
export class SettingsPage implements OnInit {

  constructor( public soundsService: SoundsService ) { }

  ngOnInit() {
  }

  public getVolumeIcon(): string {

    let iconName = 'volume-';

    switch (this.soundsService.getVolume()) {

      case 0:
        iconName += 'off';
        break;
      case 1:
      case 2:
      case 3:
        iconName += 'low';
        break;
      case 4:
      case 5:
      case 6:
      case 7:
        iconName += 'medium';
        break;
      case 8:
      case 9:
      case 10:
        iconName += 'high';
    }

    iconName += '-outline';

    return iconName;
  }

  public volumeRangeChange( event ): void {
    this.soundsService.setVolume( event.detail.value );
  }
}
