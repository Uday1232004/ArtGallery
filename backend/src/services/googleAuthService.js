const { OAuth2Client } = require('google-auth-library');

/**
 * Verify a Google ID Token using official google-auth-library
 * @param {string} token - The raw ID Token (JWT) sent by client
 * @returns {Promise<object>} verified and parsed profile details
 */
async function verifyGoogleToken(token) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  if (!clientID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in the backend environment variables.');
  }

  // Instantiating dynamic OAuth2Client ensures that dotenv loading order never compromises operations
  const client = new OAuth2Client(clientID);
  
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientID,
  });
  
  const payload = ticket.getPayload();
  
  return {
    email: payload.email,
    name: payload.name || payload.given_name || 'Google User',
    picture: payload.picture || '',
    googleId: payload.sub
  };
}

module.exports = {
  verifyGoogleToken
};
