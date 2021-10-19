import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-albums',
    templateUrl: './albums.component.html',
    styleUrls: ['./albums.component.scss']
})
export class AlbumsComponent implements OnInit {
    public albums: SpotifyApi.SavedAlbumObject[];

    constructor(public spotifyApi: SpotifyApiService) {
        this.albums = [];
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

        let ids: number[] = [];
        if (this.spotifyApi.userInfo.savedAlbumCount <= environment.albumCount) {
            for (let index = 0; index < environment.albumCount; index++) {
                ids.push(index);
            }
        } else {
            let loop = 0;
            while (ids.length < environment.albumCount && loop < environment.albumCount * 2) {
                loop++;
                const offset = Math.floor(Math.random() * this.spotifyApi.userInfo.savedAlbumCount);
                if (!ids.includes(offset)) {
                    ids.push(offset);
                }
            }
        }

        this.albums = [];

        for (let index = 0; index < ids.length; index++) {
            const response = await this.spotifyApi.get<SpotifyApi.PagingObject<SpotifyApi.SavedAlbumObject>>(`me/albums?limit=1&offset=${ids[index]}`);
            this.albums.push(response.items[0]);
        }
    }
}
