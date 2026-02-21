/**
 * Test LinkedIn token exchange with current credentials
 * This will attempt to exchange a code for a token
 */

require('dotenv').config();

const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

console.log('🔍 Testing LinkedIn Token Exchange\n');
console.log('Client ID:', clientId);
console.log('Client Secret:', clientSecret?.substring(0, 20) + '...');
console.log('Redirect URI:', redirectUri);
console.log('\n' + '='.repeat(60));

console.log('\n⚠️  IMPORTANT: This test requires a REAL authorization code');
console.log('To get one:');
console.log('1. Go to: http://localhost:3000/api/auth/linkedin');
console.log('2. Authorize the app');
console.log('3. Copy the "code" parameter from the callback URL');
console.log('4. Paste it below when prompted\n');

// For now, just test the secret format
console.log('📋 Client Secret Analysis:');
if (clientSecret.startsWith('WPL_AP1.')) {
    console.log('❌ CRITICAL ISSUE DETECTED\n');
    console.log('Your client secret starts with "WPL_AP1."');
    console.log('This is LinkedIn\'s ENCRYPTED app secret format.');
    console.log('\nLinkedIn OAuth 2.0 token endpoint REQUIRES:');
    console.log('  ✓ Plain text client secret (random alphanumeric string)');
    console.log('  ✗ NOT the WPL_AP1 encrypted format\n');
    console.log('The WPL_AP1 format is used for:');
    console.log('  - Webhook signature verification');
    console.log('  - App-level authentication');
    console.log('  - NOT for OAuth token exchange\n');
    console.log('🔧 FIX:');
    console.log('1. Go to https://www.linkedin.com/developers/apps');
    console.log('2. Select your app → Auth tab');
    console.log('3. Look for "Client Secret" section');
    console.log('4. Click "Reset client secret" if needed');
    console.log('5. Copy the PLAIN TEXT secret (no WPL_AP1 prefix)');
    console.log('6. Update LINKEDIN_CLIENT_SECRET in .env\n');

    console.log('📖 Reference:');
    console.log('https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication');
    console.log('\nToken exchange will FAIL with WPL_AP1 format.');
} else {
    console.log('✅ Client secret format appears correct (plain text)');
    console.log('\nTo test token exchange, you need an authorization code.');
    console.log('Run the OAuth flow and check server logs for errors.');
}

console.log('\n' + '='.repeat(60));
