import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyApiService } from 'src/app/spotify-api.service';

@Component({
    selector: 'app-artist',
    templateUrl: './artist.component.html',
    styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit {
    public artist: SpotifyApi.ArtistObjectFull | undefined;
    public albums: SpotifyApi.AlbumObjectSimplified[] | undefined;
    public albumsSaved: boolean[];

    constructor(public spotifyApi: SpotifyApiService, private route: ActivatedRoute) {
        this.albumsSaved = [];
    }

    ngOnInit(): void {
        this.fetch();
    }

    public async fetch() {
        const artistId = this.route.snapshot.paramMap.get("id");
        if (artistId == null) {
            return;
        }

        let artistPromise = this.spotifyApi.get<SpotifyApi.ArtistObjectFull>(`artists/${artistId}`);
        let albumPromise = this.spotifyApi.getAlbums(artistId, undefined);
        
        this.artist = await artistPromise;
        this.albums = await albumPromise;

        let albumIds = '';
        for (let index = 0; index < this.albums.length; index++) {
            const album = this.albums[index];
            if (albumIds !== '') {
                albumIds += ',';
            }

            albumIds += album.id;
        }
        
        const savedAlbumResponse = await this.spotifyApi.get<SpotifyApi.CheckUserSavedAlbumsResponse>(`me/albums/contains?ids=${albumIds}`);
        this.albumsSaved = savedAlbumResponse;
    }
}
