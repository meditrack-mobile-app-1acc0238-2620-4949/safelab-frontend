# SafeLab Frontend - Vercel Deployment

Use these exact values in Vercel:

- Framework Preset: Vite
- Root Directory: empty
- Install Command: `corepack enable && corepack prepare pnpm@10.14.0 --activate && pnpm install --no-frozen-lockfile`
- Build Command: `corepack enable && corepack prepare pnpm@10.14.0 --activate && pnpm run build`
- Output Directory: `dist`

Environment variables:

```env
VITE_API_BASE_URL=https://safelab-platform-api.onrender.com/api/v1
VITE_APP_NAME=SafeLab
VITE_DEFAULT_LOCALE=es
VITE_USE_REMOTE_API=true
NODE_VERSION=24
```

If Vercel has old failed builds, redeploy with Clear Build Cache.
