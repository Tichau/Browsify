import packageInfo from '../../package.json';

export const environment = {
  production: true,
  redirectUri: 'http://browsify.aallard.net/callback/',
  version: packageInfo.version,
  albumCount: 12,
};
