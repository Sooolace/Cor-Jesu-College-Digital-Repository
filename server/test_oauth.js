const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

// OAuth Client setup
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('Testing Google OAuth configuration');
console.log('---------------------------------');
console.log(`Using client ID: ${clientId ? clientId.substring(0, 10) + '...' : 'Not found'}`);
console.log(`Using client secret: ${clientSecret ? 'Present (hidden)' : 'Not found'}`);

// Create OAuth client 
const client = new OAuth2Client(clientId, clientSecret);

// A simple test to verify the client setup
async function testOAuthClient() {
  try {
    console.log('\nInitiating OAuth client test...');
    
    // At this point, we can only test if the client initializes without errors
    // We can't verify an actual token without user interaction
    
    // Check if the client was properly initialized
    if (client && client.constructor.name === 'OAuth2Client') {
      console.log('✅ OAuth2Client successfully initialized');
    } else {
      console.log('❌ Failed to initialize OAuth2Client');
    }
    
    console.log('\nNOTE: This only verifies the OAuth client setup.');
    console.log('To test an actual login, you need user interaction to get an ID token.');
    console.log('\nNext steps to debug your OAuth issue:');
    console.log('1. Make sure your Google Developer Console project has the proper redirect URIs');
    console.log('2. Ensure your frontend is sending the token correctly');
    console.log('3. Check the browser console for CORS or other errors');
    console.log('4. Verify that the client ID used on frontend matches the one in .env');
    
  } catch (error) {
    console.error('Error during OAuth test:', error);
  }
}

// Run the test
testOAuthClient(); 