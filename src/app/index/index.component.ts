import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ArtistSummary, SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
    public categories: Category[];

    constructor(public spotifyApi: SpotifyApiService) { 
        this.categories = [];
    }

    ngOnInit(): void {
        if (this.spotifyApi.isAuthenticated()) {
            this.refreshIndex(false);
        }
    }

    public async refreshIndex(force: boolean) {
        if (this.spotifyApi.userInfo == null) {
            throw new Error('User should be connected to fetch albums.');
        }

        if (force || this.spotifyApi.userInfo.followedArtists.length == 0) {
            await this.spotifyApi.refreshFollowedArtists();
        }
        
        let sortedArtists: ArtistSummary[] = Object.assign([], this.spotifyApi.userInfo.followedArtists);;
        sortedArtists.sort((left, right) => left.name.localeCompare(right.name));

        let startIndex = 0;
        for (let index = 'A'.charCodeAt(0); index < 'X'.charCodeAt(0); index++) {
            const categoryName =  String.fromCharCode(index);
            startIndex = this.createCategory(categoryName, sortedArtists, startIndex)
        }

        startIndex = this.createCategory('X-Z', sortedArtists, startIndex)
        this.createCategory('#', sortedArtists, startIndex)
    }

    private createCategory(categoryName: string, sortedArtists: ArtistSummary[], startIndex: number): number {
        let artists: ArtistSummary[] = [];
        let index = startIndex;
        for (; index < sortedArtists.length; index++) {
            const artist = sortedArtists[index];
            const upperName = artist.name.toLocaleUpperCase();
            let valid = false;
            switch (categoryName) {
                case 'X-Z':
                    valid = upperName.startsWith('X') || upperName.startsWith('Y') || upperName.startsWith('Z');
                    break;
                case '#':
                    valid = true;
                    break;
                default:
                    valid = upperName.startsWith(categoryName);
                    break;
            }

            if (valid) {
                artists.push(artist);
            } else {
                break;
            }
        }

        this.categories.push(new Category(categoryName, artists));
        return index;
    }
}

export class Category {
    public name: string;
    public artists: ArtistSummary[];

    public constructor (name: string, artists: ArtistSummary[]) {
        this.name = name;
        this.artists = artists;
    }
}
