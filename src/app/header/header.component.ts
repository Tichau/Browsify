import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SpotifyApiService } from '../spotify-api.service';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public appVersion: string = environment.version;

    constructor(public spotifyApi: SpotifyApiService) {
    }

    ngOnInit(): void {
    }
}
