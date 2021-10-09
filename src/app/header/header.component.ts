import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    constructor(public spotifyApi: SpotifyApiService) {

    }

    ngOnInit(): void {
    }
}
