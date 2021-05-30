import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { BaseExercisePage } from './exercises/base-exercise/base-exercise.page';
import { ExercisesPage } from './exercises/exercises.page';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'exercises',
    pathMatch: 'full'
  },
  {
    path: 'exercises',
    component:  ExercisesPage
  },
  {
    path: 'base-exercise',
    component: BaseExercisePage
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
