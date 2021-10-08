import { Component } from '@angular/core';
import { SpotifyApiService } from './spotify-api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'spotify-browser';

    constructor(public spotifyApi: SpotifyApiService) {
    }
}
