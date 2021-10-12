import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistsComponent } from './artists/artists.component';

import { AuthenticationComponent } from './authentication/authentication.component';
import { HomeComponent } from './home/home.component';
import { TracksComponent } from './tracks/tracks.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthenticationComponent },
  { path: 'callback', component: AuthenticationComponent },
  { path: 'tracks', component: TracksComponent },
  { path: 'albums', component: HomeComponent },
  { path: 'artists', component: ArtistsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
