# LinkedIn OAuth Setup Guide

## Quick Start

### 1. Stop the dev server
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### 2. Regenerate Prisma Client
```bash
npx prisma generate
```

### 3. Create LinkedIn Developer App

1. Visit: https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in required details
4. In "Auth" tab, add redirect URL: `http://localhost:3000/api/auth/linkedin/callback`
5. Request permissions: `openid`, `profile`, `email`, `w_member_social`
6. Copy your **Client ID** and **Client Secret**

### 4. Generate Encryption Secret

**Windows (PowerShell)**:
```powershell
# Generate a random 64-character hex string
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Alternative (any platform with Node.js)**:
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Update .env File

Replace the placeholder values in `.env`:

```env
LINKEDIN_CLIENT_ID=<paste_your_client_id>
LINKEDIN_CLIENT_SECRET=<paste_your_client_secret>
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
ENCRYPTION_SECRET=<paste_your_64_char_hex>
```

### 6. Restart Dev Server

```bash
npm run dev
```

### 7. Test the Integration

1. Go to http://localhost:3000
2. Click "Settings" tab
3. Click "Connect LinkedIn"
4. Authorize the app
5. Generate a post and click "Post Now"

## Troubleshooting

### Prisma Generate Fails

**Error**: `EPERM: operation not permitted`

**Solution**: Stop the dev server first, then run `npx prisma generate`

### OAuth Redirect Fails

**Error**: Redirect URI mismatch

**Solution**: Ensure the redirect URI in LinkedIn Developer App matches exactly:
`http://localhost:3000/api/auth/linkedin/callback`

### Token Encryption Fails

**Error**: `ENCRYPTION_SECRET must be a 64-character hex string`

**Solution**: Generate a proper secret using the commands above (must be exactly 64 hex characters)

### Publishing Fails

**Error**: `LinkedIn token expired`

**Solution**: Go to Settings and click "Reconnect LinkedIn"

## Production Deployment

When deploying to production:

1. Update `LINKEDIN_REDIRECT_URI` to your production domain:
   ```env
   LINKEDIN_REDIRECT_URI=https://yourdomain.com/api/auth/linkedin/callback
   ```

2. Add the same URL to LinkedIn Developer App's redirect URLs

3. Ensure `ENCRYPTION_SECRET` is different from development

4. Set `NODE_ENV=production` for secure cookies
