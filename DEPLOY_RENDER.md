**Despliegue en Render (Static Site + Web Service para TOTP)**

Resumen rápido:
- El sitio frontend se despliega como `Static Site` apuntando a la carpeta `dist` (Vite build).
- El microservicio `server/` (Node + Express) actúa como endpoint seguro para operaciones que requieren la `SERVICE_ROLE_KEY` (p.ej. verificación TOTP).

Archivos creados:
- `render.yaml` — manifiesto para Render (static site + web service).
- `server/package.json` y `server/index.js` — microservicio Express que expone `POST /api/verify-totp`.

Variables de entorno a configurar en Render:
- Para el **Static Site** (Frontend):
  - `VITE_SUPABASE_URL` = tu Supabase URL
  - `VITE_SUPABASE_ANON_KEY` = tu Supabase anon key

- Para el **Web Service** (Server, no público al cliente):
  - `SUPABASE_URL` = misma Supabase URL
  - `SUPABASE_SERVICE_ROLE_KEY` = service role key (NO exponer al cliente)

Pasos para desplegar usando la UI de Render:
1. Conecta tu repo `Hackzero8/codespaces-react` a Render.
2. Crea un servicio **Static Site**:
   - Branch: `main`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`
   - Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Environment.
3. Crea un servicio **Web Service** (Node):
   - Branch: `main`
   - Build Command: `cd server && npm ci`
   - Start Command: `cd server && npm start`
   - Añade `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en Environment (marca como secreto).
4. Opcional: usa `render.yaml` en la raíz si prefieres deploy infra-as-code; Render detectará y creará los servicios.

Probar localmente:
- Frontend: desde la raíz del repo
  ```bash
  npm ci
  npm run build
  npx serve dist # o usa vite preview: npm run preview
  ```
- Server:
  ```bash
  cd server
  npm ci
  SUPABASE_URL="https://..." SUPABASE_SERVICE_ROLE_KEY="..." node index.js
  # POST /api/verify-totp { user_id, token }
  ```

Seguridad y notas:
- No pongas la `SERVICE_ROLE_KEY` en variables `VITE_` o en el cliente.
- Revisa los CORS y limita el origen del web service si lo deseas.
- Asegúrate de que la tabla `user_2fa` (o el lugar donde guardas el secreto) exista y que la función que inserta el secreto la guarde en `base32` (o ajusta `speakeasy` encoding).
