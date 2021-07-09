import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { ExercisesPage } from './exercises/exercises.page';
import { BaseExercisePage } from './exercises/pages/base-exercise.page';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'home/exercises',
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
    path: 'test/:camera',
    loadChildren: () => import('./test/test.module').then( m => m.TestPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home-page/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'achievements',
    loadChildren: () => import('./pages/achievements/achievements.module').then( m => m.AchievementsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
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
