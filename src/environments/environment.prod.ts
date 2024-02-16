import packageInfo from '../../package.json';

export const environment = {
  production: true,
  spotifyClientId: '1091f9db9b7d4f51b47f57b3a766c0dc',
  redirectUri: 'https://browsify.aallard.net/callback/',
  version: packageInfo.version,
  albumCount: 12,
};
