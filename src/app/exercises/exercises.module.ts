import {  NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExercisesPage } from './exercises.page';
import { BaseExercisePage } from './base-exercise/base-exercise.page';
import { AppRoutingModule } from '../app-routing.module';
import { ComponentsModule } from '../components.module';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule
  ],
  declarations: [
    ExercisesPage,
    BaseExercisePage
  ]
})
export class ExercisesModule {}
