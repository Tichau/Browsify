import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AlbumsComponent } from './albums/albums.component';
import { ArtistsComponent } from './artists/artists.component';

import { AuthenticationComponent } from './authentication/authentication.component';
import { HomeComponent } from './home/home.component';
import { ArtistComponent } from './index/artist/artist.component';
import { IndexComponent } from './index/index.component';
import { RelatedComponent } from './related/related.component';
import { TracksComponent } from './tracks/tracks.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'auth', component: AuthenticationComponent },
    { path: 'callback', component: AuthenticationComponent },
    { path: 'tracks', component: TracksComponent },
    { path: 'albums', component: AlbumsComponent },
    { path: 'artists', component: ArtistsComponent },
    { path: 'related', component: RelatedComponent },
    { path: 'index', component: IndexComponent },
    { path: 'index/:id', component: ArtistComponent },
];

const extraOptions: ExtraOptions = {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
}

@NgModule({
    imports: [RouterModule.forRoot(routes, extraOptions)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
