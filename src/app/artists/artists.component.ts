import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-artists',
    templateUrl: './artists.component.html',
    styleUrls: ['./artists.component.scss']
})
export class ArtistsComponent implements OnInit {
    public albums: SpotifyApi.AlbumObjectSimplified[];

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

        if (this.spotifyApi.userInfo.followedArtists.length == 0) {
            await this.spotifyApi.refreshFollowedArtists();
        }

        this.albums = [];
        
        let ids: string[] = [];
        let loop = 0;
        while (this.albums.length < environment.albumCount && loop < environment.albumCount * 2) {
            loop++
            const offset = Math.floor(Math.random() * this.spotifyApi.userInfo.followedArtists.length);
            const artistId = this.spotifyApi.userInfo.followedArtists[offset].id
            
            let availableAlbums = await this.spotifyApi.getAlbums(artistId, false);
            while (availableAlbums.length > 0) {
                const offset = Math.floor(Math.random() * availableAlbums.length);
                if (!ids.includes(availableAlbums[offset].id)) {
                    ids.push(availableAlbums[offset].id);
                    this.albums.push(availableAlbums[offset]);
                    break;
                } else {
                    availableAlbums.splice(offset, 1);
                }
            }
        }
    }
}
