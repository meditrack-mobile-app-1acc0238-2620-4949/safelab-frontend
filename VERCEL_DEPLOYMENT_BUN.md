# SafeLab Frontend - Vercel Deploy con Bun

Esta versión evita npm y pnpm en el build cloud. Vercel instalará dependencias con Bun y compilará con Vite.

## Configuración en Vercel

- Framework Preset: Vite
- Root Directory: vacío si package.json está en la raíz
- Install Command: `bun install`
- Build Command: `bun run build`
- Output Directory: `dist`

## Environment Variables

```env
NODE_VERSION=24
VITE_API_BASE_URL=https://safelab-platform-api.onrender.com/api/v1
VITE_APP_NAME=SafeLab
VITE_DEFAULT_LOCALE=es
VITE_USE_REMOTE_API=true
```

Después de desplegar, agrega la URL de Vercel al backend en Render:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://TU-FRONTEND.vercel.app
```

Luego ejecuta Manual Deploy del backend.
