# Browsify

The idea of browsify is to help you varies the music you listen on Spotify.
I like listening music by listening whole albums, and I think Spotify does not encourage you to do that.
Also Spotify do not propose old known things to you and it's always nice to re-listen a good old album.

Browsify is very simple, it proposes 10 albums to listen by randomly selecting it in your library.
You can then choose what you want to listen depending on your mood.

## Setup working environment

Install node.js (on Windows `winget install OpenJS.NodeJS`)

`npm install`

## Host Browsify

Sadly Spotify does not allow to make this app public (no more than 25 users for homebrew projects), so you'll need to host it yourself if you want to use it.

To host it you need to:

* Create a Spotify Application [here](https://developer.spotify.com/dashboard/)
* Once created you will have a cliendId, copy it.
* Edit the file `src\environments\environment.prod.ts`
  * Paste your clientId in the variable spotifyClientId
  * Change the redirectUri to match your domain name
* Use the deploy script to deploy it on a branch of your repository `./deploy.sh gh-pages`. You can for example deploy it using GitHub pages easily.
