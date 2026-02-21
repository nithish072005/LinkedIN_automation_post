/**
 * LinkedIn OAuth Diagnostic Tool
 * Run this to verify your OAuth configuration
 */

const crypto = require('crypto');

console.log('🔍 LinkedIn OAuth Configuration Check\n');

// Check environment variables
const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
const encryptionSecret = process.env.ENCRYPTION_SECRET;

console.log('📋 Environment Variables:');
console.log('✓ LINKEDIN_CLIENT_ID:', clientId ? `${clientId.substring(0, 10)}...` : '❌ MISSING');
console.log('✓ LINKEDIN_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 15)}...` : '❌ MISSING');
console.log('✓ LINKEDIN_REDIRECT_URI:', redirectUri || '❌ MISSING');
console.log('✓ ENCRYPTION_SECRET:', encryptionSecret ? `${encryptionSecret.length} chars` : '❌ MISSING');

// Check client secret format
console.log('\n🔐 Client Secret Analysis:');
if (clientSecret) {
    if (clientSecret.startsWith('WPL_AP1.')) {
        console.log('❌ CRITICAL: You are using an ENCRYPTED app secret (WPL_AP1.*)');
        console.log('   This is NOT the OAuth client secret!');
        console.log('   ');
        console.log('   📌 ACTION REQUIRED:');
        console.log('   1. Go to https://www.linkedin.com/developers/apps');
        console.log('   2. Select your app → Auth tab');
        console.log('   3. Look for "Client Secret" (NOT "App Secret")');
        console.log('   4. Copy the PLAIN TEXT secret');
        console.log('   5. Update LINKEDIN_CLIENT_SECRET in .env');
    } else {
        console.log('✅ Client secret format looks correct (plain text)');
    }
}

// Check encryption secret
console.log('\n🔒 Encryption Secret:');
if (encryptionSecret) {
    if (encryptionSecret.length === 64) {
        console.log('✅ Encryption secret is 64 characters (correct)');
        // Test encryption/decryption
        try {
            const testToken = 'test_token_12345';
            const key = Buffer.from(encryptionSecret, 'hex');
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(testToken, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            console.log('✅ Encryption test passed');
        } catch (error) {
            console.log('❌ Encryption test failed:', error.message);
        }
    } else {
        console.log(`❌ Encryption secret is ${encryptionSecret.length} characters (should be 64)`);
    }
}

// Check redirect URI format
console.log('\n🔗 Redirect URI:');
if (redirectUri) {
    if (redirectUri.includes('localhost') && !redirectUri.startsWith('http://')) {
        console.log('⚠️  WARNING: Redirect URI should start with http:// for localhost');
    } else if (redirectUri.endsWith('/')) {
        console.log('⚠️  WARNING: Redirect URI should NOT end with a slash');
    } else {
        console.log('✅ Redirect URI format looks correct');
    }

    console.log('\n   📌 Verify this EXACT URL is in LinkedIn app settings:');
    console.log(`   ${redirectUri}`);
}

// Generate test authorization URL
console.log('\n🌐 Test Authorization URL:');
if (clientId && redirectUri) {
    const state = crypto.randomBytes(16).toString('hex');
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state,
        scope: 'openid profile email w_member_social',
    });
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    console.log('✅ Generated authorization URL (first 100 chars):');
    console.log(`   ${authUrl.substring(0, 100)}...`);
}

console.log('\n📊 Summary:');
console.log('━'.repeat(60));

const issues = [];
if (!clientId) issues.push('Missing LINKEDIN_CLIENT_ID');
if (!clientSecret) issues.push('Missing LINKEDIN_CLIENT_SECRET');
if (clientSecret && clientSecret.startsWith('WPL_AP1.')) {
    issues.push('CRITICAL: Using encrypted app secret instead of OAuth client secret');
}
if (!redirectUri) issues.push('Missing LINKEDIN_REDIRECT_URI');
if (!encryptionSecret) issues.push('Missing ENCRYPTION_SECRET');
if (encryptionSecret && encryptionSecret.length !== 64) {
    issues.push('Invalid ENCRYPTION_SECRET length');
}

if (issues.length === 0) {
    console.log('✅ All configuration checks passed!');
    console.log('\n📌 Next steps:');
    console.log('1. Verify LinkedIn app has "Share on LinkedIn" product approved');
    console.log('2. Check browser console for errors during OAuth flow');
    console.log('3. Run: node check-db.js (to verify database state)');
} else {
    console.log('❌ Issues found:');
    issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
    });
}

console.log('━'.repeat(60));
