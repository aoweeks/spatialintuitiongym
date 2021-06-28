import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { ExercisesPage } from './exercises/exercises.page';
import { BaseExercisePage } from './exercises/pages/base-exercise.page';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'base-exercise',
    pathMatch: 'full'
  },
  {
    path: 'exercises',
    component:  ExercisesPage
  },
  {
    path: 'base-exercise',
    component: BaseExercisePage
  },
  {
    path: 'test',
    loadChildren: () => import('./test/test.module').then( m => m.TestPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home-page/home.module').then( m => m.HomePageModule)
  },

  // {
  //   path: 'cube-stack',
  //   // loadChildren: () => import('./exercises/pages/cube-stack/cube-stack.module').then( m => m.CubeStackPageModule)
  // }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
