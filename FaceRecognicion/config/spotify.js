const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: '6ea2ece7cf9847cc8268106a461d2b56',
  clientSecret: '03e921ce53684732bcc11bbb328e520c',
});

const authenticateSpotify = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('Spotify API authenticated');
  } catch (error) {
    console.error('Error authenticating Spotify API:', error);
  }
};

// Authenticate Spotify API on startup
authenticateSpotify();

// Re-authenticate when token expires
setInterval(authenticateSpotify, 3600 * 1000);

module.exports = spotifyApi;
