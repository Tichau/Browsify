import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyApiService } from '../spotify-api.service';

@Component({
    selector: 'app-authentication',
    templateUrl: './authentication.component.html',
    styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
    public status: string = '';

    constructor(private router: Router, private route: ActivatedRoute, private spotifyApi: SpotifyApiService) {
    }

    ngOnInit(): void {
        if (this.spotifyApi.isAuthenticated()) {
            return;
        }
        
        // https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce
        
        const redirectUri: string = 'http://localhost:4200/callback/';
        // const redirectUri: string = 'http://browsify.aallard.net/callback/';
        
        let state = this.router.url;
        if (state.startsWith("/auth")) {
            this.spotifyApi.askForCode(redirectUri);
        } else if (state.startsWith("/callback")) {
            this.route.queryParamMap.subscribe(paramMap => {
                let state = paramMap.get('state');
                const authState = <string>window.localStorage.getItem('authState');
                window.localStorage.removeItem('authState');
                if (state !== authState) {
                    this.status = "Invalid state. Authentication failed.";
                    return;
                }
    
                let error = paramMap.get('error');
                if (error !== null) {
                    this.status = `Authentication failed: ${error}`;
                    return;
                }
    
                let code = paramMap.get('code');
                if (code !== null) {
                    try {
                        this.spotifyApi.refreshTokenFromCode(redirectUri, code)
                            .then(() => this.router.navigateByUrl('/'));
                    } catch(error) {
                        this.status = error as string;
                    }
                }
            });
        }
    }
}
