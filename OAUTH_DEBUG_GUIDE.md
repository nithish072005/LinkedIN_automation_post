# LinkedIn OAuth Debugging - Senior Backend Engineer Analysis

## ROOT CAUSE (Ranked by Probability)

### 🥇 #1: Invalid Client Secret Format (95%)

**Issue**: Using WPL_AP1 encrypted secret instead of plain OAuth client secret

**Evidence**:
```bash
LINKEDIN_CLIENT_SECRET=<your_WPL_AP1_secret_here>
```

**Why this fails**:
- LinkedIn OAuth token endpoint (`/oauth/v2/accessToken`) requires plain text client secret
- WPL_AP1 format is for webhook signature verification, NOT OAuth
- Token exchange will return 401/400 error

**Verification**:
```bash
# Check server logs after OAuth attempt
# Look for: "❌ [OAuth] Token exchange failed"
# Expected error: "invalid_client" or "unauthorized_client"
```

**Fix**:
1. Go to https://www.linkedin.com/developers/apps → Your App → Auth tab
2. Find "Client Secret" (NOT "App Secret")
3. Copy plain text secret (no WPL_AP1 prefix)
4. Update `.env`:
   ```env
   LINKEDIN_CLIENT_SECRET=<plain_text_secret>
   ```
5. Restart server

---

### 🥈 #2: Missing Product Approval (80%)

**Issue**: `w_member_social` scope not approved by LinkedIn

**Why this matters**:
- Scope can be REQUESTED but not GRANTED
- Without "Share on LinkedIn" product approval, scope is ignored
- OAuth succeeds but token lacks posting permission

**Verification**:
1. LinkedIn Developer Portal → Products tab
2. Check if "Share on LinkedIn" shows "Approved" (not "Pending")

**Fix**:
- Request "Share on LinkedIn" product access
- Wait for LinkedIn approval (1-2 days)
- Re-authenticate after approval

---

### 🥉 #3: State Validation Failure (40%)

**Issue**: CSRF state cookie mismatch

**Code location**: `callback/route.ts:32-40`

**Causes**:
- Cookie not set due to httpOnly/sameSite restrictions
- State parameter corrupted
- Cookie expired (10min timeout)

**Verification**:
```bash
# Check server logs for:
# "invalid_state" redirect
```

**Fix**:
Check browser DevTools → Application → Cookies during OAuth flow:
- Should see `linkedin_oauth_state` cookie
- If missing, check cookie settings (sameSite, secure flags)

---

### #4: Token Encryption Failure (30%)

**Issue**: `encryptToken()` throws error

**Code location**: `oauth.ts:82-98`

**Causes**:
- Invalid ENCRYPTION_SECRET length (must be 64 hex chars)
- Invalid hex format

**Verification**:
```bash
# Check server logs for:
# "❌ [OAuth] Token encryption failed"
# "ENCRYPTION_SECRET must be a 64-character hex string"
```

**Fix**:
```bash
# Verify secret length
node -e "console.log(process.env.ENCRYPTION_SECRET.length)"
# Must output: 64

# Regenerate if needed
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### #5: Database Write Failure (20%)

**Issue**: Prisma update fails silently

**Code location**: `callback/route.ts:67-75`

**Causes**:
- Prisma Client not generated
- Schema mismatch
- Database locked

**Verification**:
```bash
# Check server logs for:
# "❌ [OAuth] Database update failed"

# Verify Prisma Client
npx prisma generate
```

**Fix**:
```bash
# Regenerate Prisma Client
npx prisma generate

# Check schema matches
npx prisma db push
```

---

### #6: Profile Fetch Failure (15%)

**Issue**: `/v2/userinfo` endpoint fails

**Code location**: `api.ts:10-33`

**Causes**:
- Missing `openid` scope
- Invalid access token format
- LinkedIn API downtime

**Verification**:
```bash
# Check server logs for:
# "❌ [OAuth] Profile fetch failed"
```

**Fix**:
- Ensure authorization URL includes `openid` scope
- Verify token is valid (not empty/malformed)

---

## VERIFICATION PROTOCOL

### Step 1: Check Server Logs (CRITICAL)

After clicking "Connect LinkedIn":

```bash
# Terminal running npm run dev
# Look for these logs in order:

🔄 [OAuth] Starting token exchange...
❌ [OAuth] Token exchange failed: <ERROR_MESSAGE>
```

**If you see "Token exchange failed"** → Issue #1 (Invalid secret)

### Step 2: Check Browser URL

After LinkedIn authorization:

```
Expected: http://localhost:3000/?linkedin_connected=true
Actual:   http://localhost:3000/?error=linkedin_connection_failed&details=<ERROR>
```

**Check the `details` parameter** for error type

### Step 3: Verify Database State

```bash
node check-db.js
```

Expected after successful OAuth:
- `linkedinAccessToken`: NOT NULL (encrypted string)
- `linkedinUserId`: NOT NULL
- `linkedinTokenExpiry`: Future date

### Step 4: Test Token Exchange Manually

```javascript
// test-manual-exchange.js
const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: 'PASTE_CODE_FROM_CALLBACK',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
});

fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
})
.then(r => r.json())
.then(console.log);
```

**Expected**: `{"access_token": "...", "expires_in": 5184000}`  
**If error**: `{"error": "invalid_client"}` → Confirms Issue #1

---

## PRECISE FIXES

### Fix #1: Replace Client Secret (CRITICAL)

```bash
# 1. Get correct secret from LinkedIn
# https://www.linkedin.com/developers/apps → Auth tab

# 2. Update .env
LINKEDIN_CLIENT_SECRET=<plain_text_secret_without_WPL_AP1>

# 3. Restart server
# Ctrl+C, then npm run dev
```

### Fix #2: Enhanced Logging (Already Applied)

The callback route now has detailed logging at each step:
- Token exchange
- Profile fetch
- Encryption
- Database write

**Check logs to identify exact failure point**

### Fix #3: Verify Redirect URI

```bash
# Must match EXACTLY in LinkedIn app settings
# No trailing slash, correct protocol (http/https)

# Current value:
http://localhost:3000/api/auth/linkedin/callback
```

### Fix #4: Check Scope Approval

```bash
# Authorization URL must include:
scope=openid profile email w_member_social

# Verify in: oauth.ts:29
```

---

## ACTIONABLE NEXT STEPS

1. **Immediate**: Check server logs during next OAuth attempt
2. **Critical**: Replace WPL_AP1 secret with plain text secret
3. **High**: Verify "Share on LinkedIn" product is approved
4. **Medium**: Run `node check-db.js` after OAuth to verify save
5. **Low**: Test manual token exchange if issue persists

---

## EXPECTED LOG OUTPUT (Success)

```
🔄 [OAuth] Starting token exchange...
✅ [OAuth] Token exchange successful
🔄 [OAuth] Fetching LinkedIn profile...
✅ [OAuth] Profile fetched: <user_id>
🔄 [OAuth] Encrypting token...
✅ [OAuth] Token encrypted
🔄 [OAuth] Saving to database...
✅ [OAuth] Database updated successfully
✅ [OAuth] LinkedIn connection complete!
```

## EXPECTED LOG OUTPUT (Failure - Invalid Secret)

```
🔄 [OAuth] Starting token exchange...
❌ [OAuth] Token exchange failed: Failed to exchange code for token: {"error":"invalid_client","error_description":"..."}
   Full error: Error: Failed to exchange code for token...
❌ [OAuth] Callback error: TOKEN_EXCHANGE_FAILED: Failed to exchange code for token...
```

---

## SUMMARY

**Most likely issue**: WPL_AP1 secret format is invalid for OAuth token exchange.

**Immediate action**: Replace client secret with plain text version from LinkedIn Developer Portal.

**Verification**: Server logs will now show exactly which step fails.
