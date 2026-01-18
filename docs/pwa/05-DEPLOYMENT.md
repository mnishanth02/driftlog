# Phase 5: Vercel Deployment

**Duration:** 1 hour

---

## Overview

Configure Vercel deployment with required COOP/COEP headers for SharedArrayBuffer.

---

## Critical: COOP/COEP Headers

expo-sqlite on web requires `SharedArrayBuffer`, which needs these headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

**Without these headers, the database will not work.**

These headers enable `SharedArrayBuffer` by isolating the page from cross-origin content.

---

## Tasks

### 5.1 Create Vercel Configuration

**Create:** `vercel.json` at project root

**Complete configuration:**
```json
{
  "buildCommand": "pnpm web:build",
  "outputDirectory": "dist",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!_expo|_next|api|static|assets|[\\w-]+\\.\\w+).*)",
      "destination": "/"
    }
  ]
}
```

**Configuration explanation:**

| Section | Purpose |
|---------|---------|
| `buildCommand` | Command Vercel runs to build app |
| `outputDirectory` | Where build artifacts are located |
| `framework: null` | Disable automatic framework detection |
| `headers` | Add COOP/COEP to all routes |
| `rewrites` | SPA fallback - route all non-file requests to index.html |

**Rewrites regex breakdown:**
- `(?!_expo|_next|api|static|assets|[\\w-]+\\.\\w+)` - Negative lookahead
- Excludes: `_expo/`, `_next/`, `api/`, `static/`, `assets/`, and files with extensions
- Everything else redirects to `/` (index.html)

---

### 5.2 Update .gitignore

Ensure build output isn't committed:

**Add to `.gitignore`:**
```
# Web build output
dist/
```

Verify:
```bash
echo "dist/" >> .gitignore
```

---

### 5.3 Deploy to Vercel

**Option A: Vercel CLI (Recommended for first deploy)**

Install Vercel CLI:
```bash
pnpm add -g vercel
```

Deploy:
```bash
vercel
```

Follow prompts:
1. Set up and deploy? **Y**
2. Which scope? Select your account
3. Link to existing project? **N** (first time)
4. Project name? **driftlog** or custom name
5. Directory containing code? **./** (root)
6. Vercel will detect `vercel.json` and use those settings

**Production deployment:**
```bash
vercel --prod
```

---

**Option B: GitHub Integration (Recommended for CI/CD)**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel automatically detects `vercel.json`
6. Click "Deploy"

**Automatic deployments:**
- Push to `main` → Production deployment
- Push to other branches → Preview deployment

---

### 5.4 Verify Deployment

After deployment completes:

1. **Open deployed URL**
   - Vercel provides URL like `driftlog.vercel.app`

2. **Check headers in DevTools**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Refresh page
   - Click on main document request
   - Go to **Headers** section
   - Verify presence of:
     ```
     cross-origin-opener-policy: same-origin
     cross-origin-embedder-policy: require-corp
     ```

3. **Test SharedArrayBuffer**
   - Open Console
   - Type: `typeof SharedArrayBuffer`
   - Should output: `"function"`
   - If `"undefined"`, headers are not working

4. **Test database operations**
   - Create a new workout session
   - Add exercises
   - Verify data persists
   - Check Console for SQLite errors

5. **Test PWA installation**
   - Look for install prompt in browser
   - Install PWA
   - Launch installed app
   - Verify standalone mode (no browser UI)

---

## Alternative: Netlify Deployment

If using Netlify instead of Vercel:

### Create Netlify Configuration Files

**1. Create `public/_headers`:**
```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

**2. Create `public/_redirects`:**
```
/*    /index.html   200
```

**3. Create `netlify.toml`:**
```toml
[build]
  command = "pnpm web:build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

**Deploy:**
```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## Alternative: Cloudflare Pages

**Create `wrangler.toml`:**
```toml
name = "driftlog"
compatibility_date = "2024-01-01"

[site]
  bucket = "./dist"

[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

**Deploy:**
```bash
npx wrangler pages publish dist
```

---

## Environment Variables (Optional)

If you need environment variables:

**Vercel:**
```bash
vercel env add VARIABLE_NAME
```

Or in Vercel dashboard: Settings > Environment Variables

**Access in code:**
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

---

## Custom Domain (Optional)

**Vercel:**
1. Go to project settings
2. Click "Domains"
3. Add your domain
4. Follow DNS setup instructions

**DNS Records:**
- Type: CNAME
- Name: @ (or subdomain)
- Value: cname.vercel-dns.com

---

## Monitoring

**Vercel Analytics (Optional):**
```bash
pnpm add @vercel/analytics
```

```tsx
// In app/_layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <>
      {/* Your app */}
      <Analytics />
    </>
  );
}
```

---

## Troubleshooting

**Issue:** Database not working on production
- **Check:** Headers present in Network tab
- **Check:** Console for CORS errors
- **Fix:** Verify `vercel.json` is committed and deployed

**Issue:** 404 on refresh
- **Check:** Rewrites configuration
- **Fix:** Verify SPA fallback rule in `vercel.json`

**Issue:** Build fails
- **Check:** Build logs in Vercel dashboard
- **Common:** Missing dependencies, wrong Node version
- **Fix:** Ensure `package.json` has all dependencies

**Issue:** Environment variables not working
- **Check:** Variables start with `EXPO_PUBLIC_`
- **Check:** Variables set in Vercel dashboard
- **Fix:** Redeploy after adding variables

---

## Files

| File | Action |
|------|--------|
| `vercel.json` | Created |
| `.gitignore` | Modified (add `dist/`) |

---

## Next Phase

[Phase 6: Responsive Design](./06-RESPONSIVE.md)
