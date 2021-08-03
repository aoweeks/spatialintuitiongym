import {  NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExercisesPage } from './exercises.page';
import { BaseExercisePage } from './pages/base-exercise.page';
import { AppRoutingModule } from '../app-routing.module';
import { ComponentsModule } from '../components.module';
import { CubeStackPage } from './pages/cube-stack/cube-stack.page';
import { DirectivesModule } from '../directives/directives.module';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    DirectivesModule
  ],
  declarations: [
    ExercisesPage,
    BaseExercisePage,
    CubeStackPage
  ]
})
export class ExercisesModule {}
