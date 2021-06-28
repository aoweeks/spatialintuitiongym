import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from 'src/app/pages/home-page/home.page';
import { ExercisesPage } from '../../exercises/exercises.page';


const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'exercises',
        component: ExercisesPage
      }
    ]
  },
  // {
  //   path: '/exercises',
  //   component: ExercisesPage
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
