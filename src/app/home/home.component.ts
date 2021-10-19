import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(public spotifyApi: SpotifyApiService, private router: Router) {
    }

    ngOnInit(): void {
        if (this.spotifyApi.isAuthenticated()) {
            this.router.navigateByUrl('albums');
        }
    }
}
