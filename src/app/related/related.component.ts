import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ArtistSummary, SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-related',
    templateUrl: './related.component.html',
    styleUrls: ['./related.component.scss']
})
export class RelatedComponent implements OnInit {
    public albums: RelatedAlbum[];

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

            // Pick a followed artist.
            const offset = Math.floor(Math.random() * this.spotifyApi.userInfo.followedArtists.length);
            const originArtist = this.spotifyApi.userInfo.followedArtists[offset];

            // Get related artists and remove artists already followed.
            let newArtists = [];
            const relatedArtistsResponse = await this.spotifyApi.get<SpotifyApi.ArtistsRelatedArtistsResponse>(`artists/${originArtist.id}/related-artists`);
            for (let index = 0; index < relatedArtistsResponse.artists.length; index++) {
                const artist = relatedArtistsResponse.artists[index];

                let alreadyFollowed = false;
                for (let followedIndex = 0; followedIndex < this.spotifyApi.userInfo.followedArtists.length; followedIndex++) {
                    if (artist.name == this.spotifyApi.userInfo.followedArtists[followedIndex].name) {
                        alreadyFollowed = true;
                        break;
                    }
                }

                if (!alreadyFollowed) {
                    newArtists.push(artist);
                }
            }

            if (newArtists.length == 0) {
                continue;
            }

            // Pick a related artist
            const relatedOffset = Math.floor(Math.random() * newArtists.length);
            const relatedArtist = newArtists[relatedOffset];
            
            // Pick an album
            let availableAlbums = await this.spotifyApi.getAlbums(relatedArtist.id, false);
            while (availableAlbums.length > 0) {
                const offset = Math.floor(Math.random() * availableAlbums.length);
                if (!ids.includes(availableAlbums[offset].id)) {
                    ids.push(availableAlbums[offset].id);
                    this.albums.push(new RelatedAlbum(availableAlbums[offset], relatedArtist, originArtist));
                    break;
                } else {
                    availableAlbums.splice(offset, 1);
                }
            }
        }
    }
}

class RelatedAlbum {
    public album: SpotifyApi.AlbumObjectSimplified;
    public artist: SpotifyApi.ArtistObjectFull;
    public originArtist: ArtistSummary;

    constructor(album: SpotifyApi.AlbumObjectSimplified, artist: SpotifyApi.ArtistObjectFull, originArtist: ArtistSummary) {
        this.album = album;
        this.artist = artist;
        this.originArtist = originArtist;
    }

    public getFooter(): string {
        return `related to ${this.originArtist.name}`;
    }
}
