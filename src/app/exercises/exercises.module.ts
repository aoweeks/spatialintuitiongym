import {  NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExercisesPage } from './exercises.page';
import { BaseThreeRendererComponent } from './base-three-renderer/base-three-renderer.component';
import { BaseExercisePage } from './base-exercise/base-exercise.page';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    ExercisesPage,
    BaseExercisePage,
    BaseThreeRendererComponent
  ],
  exports: [
    BaseExercisePage,
    BaseThreeRendererComponent
  ]
})
export class ExercisesPageModule {}
