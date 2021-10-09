/// <reference path="../../node_modules/@types/spotify-api/index.d.ts" />

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SHA256 } from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class SpotifyApiService {
    public userInfo: UserInfo | null;

    private readonly clientId: string = '1091f9db9b7d4f51b47f57b3a766c0dc';
    private readonly scopes: string[] = [
        "user-library-read",
        "user-modify-playback-state"
    ]

    private accessToken: string | null;
    private refreshToken: string | null;

    constructor(private http: HttpClient) {
        this.accessToken = window.localStorage.getItem('accessToken');
        this.refreshToken = window.localStorage.getItem('refreshToken');
        const userInfoString = window.localStorage.getItem('userInfo');
        if (userInfoString !== null) {
            this.userInfo = JSON.parse(userInfoString);
        } else {
            this.userInfo = null;
        }
    }
    
    public isAuthenticated(): boolean {
        return this.accessToken !== null;
    }

    public async get<T>(uri: string) : Promise<T> {
        if (this.accessToken === null) {
            throw new Error('Can\'t fetch api, user not connected.');
        }

        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${this.accessToken}`);

        try {
            const response = await this.http.get<T>(`https://api.spotify.com/v1/${uri}`, { headers }).toPromise();
            return response;
        } catch (_e: unknown) {
            const error = _e as HttpErrorResponse;
            const spotifyError = error.error.error as SpotifyApi.ErrorObject;
            console.log(spotifyError)
            if (spotifyError.status === 401 && spotifyError.message === "The access token expired") {
                await this.refreshTokenFromToken();
                return this.get<T>(uri);
            }

            throw new Error(`Error while tring to get uri '${uri}'`);
        }
    }

    public async put(uri: string, body: {}) {
        if (this.accessToken === null) {
            throw new Error('Can\'t fetch api, user not connected.');
        }

        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${this.accessToken}`);

        try {
            await this.http.put(`https://api.spotify.com/v1/${uri}`, body, { headers }).toPromise();
        } catch (_e: unknown) {
            const error = _e as HttpErrorResponse;
            const spotifyError = error.error.error as SpotifyApi.ErrorObject;
            console.log(spotifyError)
            if (spotifyError.status === 401 && spotifyError.message === "The access token expired") {
                await this.refreshTokenFromToken();
                this.put(uri, body);
            }

            throw new Error(`Error while tring to get uri '${uri}'`);
        }
    }

    public disconnect() {
        this.accessToken = null;
        window.localStorage.removeItem('accessToken');
        this.refreshToken = null;
        window.localStorage.removeItem('refreshToken');
        this.userInfo = null;
        window.localStorage.removeItem('userInfo');
    }

    public askForCode(redirectUri: string) {
        // Step 1: Create the code verifier and challenge
        const codeVerifier: string = this.generateRandomString(128);
        window.localStorage.setItem('codeVerifier', codeVerifier);

        const codeChallenge = this.PKCEChallengeFromVerifier(codeVerifier);

        const authState: string = this.generateRandomString(32);
        window.localStorage.setItem('authState', authState);

        // Step 2: Construct the authorization URI
        const encodedUri = encodeURIComponent(redirectUri);
        const encodedScopes = encodeURIComponent(this.scopes.join(' '));
        var uri = `https://accounts.spotify.com/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodedUri}&code_challenge_method=S256&code_challenge=${codeChallenge}&scope=${encodedScopes}&state=${authState}`;
        window.location.href = uri;
    }

    public async refreshTokenFromCode(redirectUri: string, code: string) {
        // Step 4: Your app exchanges the code for an access token
            
        const codeVerifier = <string>window.localStorage.getItem('codeVerifier');
        window.localStorage.removeItem('codeVerifier');

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/x-www-form-urlencoded')

        let body = new URLSearchParams()
        body.set('client_id', this.clientId);
        body.set('grant_type', 'authorization_code');
        body.set('code', code);
        body.set('redirect_uri', redirectUri);
        body.set('code_verifier', codeVerifier);

        const response = await this.http.post<any>('https://accounts.spotify.com/api/token', body.toString(), { headers }).toPromise();
        this.accessToken = <string>response['access_token'];
        this.refreshToken = <string>response['refresh_token'];

        await this.onTokenRefreshed(true);
    }

    public async refreshTokenFromToken() {
        if (this.refreshToken === null) {
            console.error("No refresh token available.");
            return;
        }
            
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/x-www-form-urlencoded')

        let body = new URLSearchParams()
        body.set('client_id', this.clientId);
        body.set('grant_type', 'refresh_token');
        body.set('refresh_token', this.refreshToken);

        const response = await this.http.post<any>('https://accounts.spotify.com/api/token', body.toString(), { headers }).toPromise()

        this.accessToken = <string>response.access_token;
        this.refreshToken = <string>response.refresh_token;

        await this.onTokenRefreshed(false);
    }

    private generateRandomString(length: number): string {
        const inOptions: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.-~';
        let outString: string = '';

        for (let i = 0; i < length; i++) {
            outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
        }

        return outString;
    }

    private PKCEChallengeFromVerifier(verifier: string) {
        let hashed = this.cryptoJsWordArrayToUint8Array(SHA256(verifier));
        let base64encoded = this.base64UrlEncode(hashed);
        return base64encoded;
    }

    private cryptoJsWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray) {                                                                                       
        const l = wordArray.sigBytes;                                                                                                        
        const words = wordArray.words;                                                                                                       
        const result = new Uint8Array(l);                                                                                                    
        var dst=0, src=0;
        while(true) {
            // here dst is a multiple of 4
            if (dst==l)
                break;
            var w = words[src++];
            result[dst++] = (w & 0xff000000) >>> 24;
            if (dst==l)
                break;
            result[dst++] = (w & 0x00ff0000) >>> 16;                                                                                            
            if (dst==l)                                                                                                                        
                break;                                                                                                                       
            result[dst++] = (w & 0x0000ff00) >>> 8;
            if (dst==l)
                break;
            result[dst++] = (w & 0x000000ff);                                                                                                  
        }
        return result;
    }
    
    private base64UrlEncode(array: ArrayBuffer) {
        // Convert the ArrayBuffer to string using Uint8 array.
        // btoa takes chars from 0-255 and base64 encodes.
        // Then convert the base64 encoded to base64url encoded: (replace + with -, replace / with _, trim trailing =)
        return btoa(String.fromCharCode.apply(null, <number[]><any>new Uint8Array(array)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    private async onTokenRefreshed(firstConnection: boolean) {
        if (this.accessToken == null || this.refreshToken == null) {
            throw new Error("Token is null");
        }

        window.localStorage.setItem('accessToken', this.accessToken);
        window.localStorage.setItem('refreshToken', this.refreshToken);
        
        if (firstConnection) {
            const profile = await this.get<SpotifyApi.UserObjectPrivate>('me');
            if (profile.display_name) {
                this.userInfo = new UserInfo(profile.display_name, profile.images ? profile.images[0].url : undefined);
            } else {
                this.userInfo = new UserInfo('unknown');
            }
        }

        if (this.userInfo == null) {
            throw new Error("UserInfo must exists at this point.");
        }

        // Refresh and cache number of saved albums.
        const response = await this.get<SpotifyApi.PagingObject<SpotifyApi.SavedAlbumObject>>('me/albums?limit=1');
        this.userInfo.savedAlbumCount = response.total;

        window.localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    }
}

export class UserInfo {
    public name: string;
    public imageUrl: string | undefined;
    public savedAlbumCount: number;

    constructor(userName: string, imageUrl?: string) {
        this.name = userName;
        this.imageUrl = imageUrl;
        this.savedAlbumCount = NaN;
    }
}
