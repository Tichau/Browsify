import { Component, Input, OnInit } from '@angular/core';
import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-album-card[album]',
    templateUrl: './album-card.component.html',
    styleUrls: ['./album-card.component.scss']
})
export class AlbumCardComponent implements OnInit {
    @Input() public album!: SpotifyApi.AlbumObjectSimplified;
    
    constructor(public spotifyApi: SpotifyApiService) { 
    }

    ngOnInit(): void {
    }

    public play(spotifyUri: string) {
        let body = {
            context_uri: spotifyUri
        };

        this.spotifyApi.put(`me/player/play`, body);
    }
}
