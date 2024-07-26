const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: 'YOUR_SPOTIFY_CLIENT_ID',
  clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET',
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
setInterval(authenticateSpotify, 3600 * 1000); // Token expires in 1 hour

module.exports = spotifyApi;
