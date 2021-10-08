import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    public albums: SpotifyApi.SavedAlbumObject[];
    public albumCount: number;
    public totalAlbumCount: number;

    constructor(public spotifyApi: SpotifyApiService) {
        this.albums = [];
        this.albumCount = 8;
        this.totalAlbumCount = 0;
    }

    ngOnInit(): void {
        if (this.spotifyApi.isAuthenticated()) {
            this.fetchAlbums();
        }
    }

    public play(spotifyUri: string) {
        let body = {
            context_uri: spotifyUri
        };

        this.spotifyApi.put(`me/player/play`, body);
    }

    public async fetchAlbums() {
        this.albums = [];

        const response = await this.spotifyApi.get<SpotifyApi.PagingObject<SpotifyApi.SavedAlbumObject>>('me/albums?limit=1');
        this.totalAlbumCount = response.total;
        
        for (let index = 0; index < this.albumCount; index++) {
            const offset = Math.floor(Math.random() * this.totalAlbumCount);
            const response = await this.spotifyApi.get<SpotifyApi.PagingObject<SpotifyApi.SavedAlbumObject>>(`me/albums?limit=1&offset=${offset}`);
            this.albums.push(response.items[0]);
        }
    }
}
