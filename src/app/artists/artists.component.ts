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
            const offset = Math.floor(Math.random() * this.spotifyApi.userInfo.followedArtists.length); // offset does not works for artist
            const artistId = this.spotifyApi.userInfo.followedArtists[offset].id
            
            let availableAlbums = [];
            let albumIds = '';
            {
                const albumResponse = await this.spotifyApi.get<SpotifyApi.PagingObject<SpotifyApi.AlbumObjectSimplified>>(`artists/${artistId}/albums?include_groups=album&limit=50`);
                for (let index = 0; index < albumResponse.items.length; index++) {
                    const album = albumResponse.items[index];
                    if (album.available_markets && album.available_markets?.indexOf('FR') < 0) {
                        continue
                    }

                    let twinFound = false;
                    for (var twinIndex = 0; twinIndex < availableAlbums.length; twinIndex++) {
                        if (availableAlbums[twinIndex].name == album.name) {
                            twinFound = true;
                            break;
                        }
                    }

                    if (twinFound) {
                        continue;
                    }

                    availableAlbums.push(album);
                    if (albumIds !== '') {
                        albumIds += ',';
                    }

                    albumIds += album.id;
                }
            }

            if (availableAlbums.length == 0) {
                continue;
            }

            const savedAlbumResponse = await this.spotifyApi.get<SpotifyApi.CheckUserSavedAlbumsResponse>(`me/albums/contains?ids=${albumIds}`);
            for (let index = availableAlbums.length - 1; index >= 0; index--) {
                if (savedAlbumResponse[index]) {
                    availableAlbums.splice(index, 1);
                }
            }

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
