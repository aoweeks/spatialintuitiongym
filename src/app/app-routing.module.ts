import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
const routes: Routes = [

  {
    path: '',
    redirectTo: 'home/exercises',
    pathMatch: 'full'
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
    path: 'progress',
    loadChildren: () => import('./pages/progress/progress.module').then( m => m.ProgressPageModule)
  }



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
