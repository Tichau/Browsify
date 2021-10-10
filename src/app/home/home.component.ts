import { Component, OnInit } from '@angular/core';

import { environment } from 'src/environments/environment';
import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    public albums: SpotifyApi.SavedAlbumObject[];
    public albumCount: number;

    constructor(public spotifyApi: SpotifyApiService) {
        this.albums = [];
        this.albumCount = 12;
    }

    ngOnInit(): void {
        if (this.spotifyApi.isAuthenticated() && environment.production) {
            this.fetchAlbums();
        }
    }

    public async fetchAlbums() {
        if (this.spotifyApi.userInfo == null) {
            throw new Error('User should be connected to fetch albums.');
        }

        this.albums = [];

        for (let index = 0; index < this.albumCount; index++) {
            const offset = Math.floor(Math.random() * this.spotifyApi.userInfo.savedAlbumCount);
            const response = await this.spotifyApi.get<SpotifyApi.PagingObject<SpotifyApi.SavedAlbumObject>>(`me/albums?limit=1&offset=${offset}`);
            this.albums.push(response.items[0]);
        }
    }
}
