import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-tracks',
    templateUrl: './tracks.component.html',
    styleUrls: ['./tracks.component.scss']
})
export class TracksComponent implements OnInit {
    public albums: SpotifyApi.AlbumObjectSimplified[];
    public albumsSaved: boolean[];

    constructor(public spotifyApi: SpotifyApiService) { 
        this.albums = [];
        this.albumsSaved = [];
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
        this.albumsSaved = [];
        let ids: string[] = [];
        let loop = 0;
        let albumIds = '';
        while (ids.length < environment.albumCount && loop < environment.albumCount * 2) {
            loop++;
            const offset = Math.floor(Math.random() * this.spotifyApi.userInfo.savedTrackCount);
            const response = await this.spotifyApi.get<SpotifyApi.PagingObject<SpotifyApi.SavedTrackObject>>(`me/tracks?limit=1&offset=${offset}`);
            const album = response.items[0].track.album;
            if (!ids.includes(album.id)) {
                this.albums.push(album);
                ids.push(album.id);
                if (albumIds !== '') {
                    albumIds += ',';
                }

                albumIds += album.id;
            }
        }

        const savedAlbumResponse = await this.spotifyApi.get<SpotifyApi.CheckUserSavedAlbumsResponse>(`me/albums/contains?ids=${albumIds}`);
        this.albumsSaved = savedAlbumResponse;
    }
}
