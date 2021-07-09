import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.page.html',
  styleUrls: [
    './exercises.page.scss',
    '../../shared.scss'
  ],
})
export class ExercisesPage{

  constructor( private router: Router ) { }

  public exerciseClick() {
    this.router.navigateByUrl('/test/1');
  }

}
