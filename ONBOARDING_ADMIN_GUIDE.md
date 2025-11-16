# 🚀 Sistema de Onboarding + Administración

## 📋 Descripción

Sistema completo de onboarding para nuevos usuarios + panel de administración protegido con roles y RLS.

### Características

✅ **Onboarding de 3 pasos:**
- Completar perfil (biografía)
- Seleccionar intereses
- Sugerencias de usuarios a seguir

✅ **Sistema de Roles:**
- `admin` - Control total
- `moderator` - Gestión de reportes
- `user` - Usuario normal

✅ **Funciones de Administración:**
- Gestión de reportes de usuarios
- Sistema de moderación (warn, suspend, ban)
- Logs de actividad
- Dashboard con estadísticas

✅ **Seguridad:**
- RLS en todas las tablas
- Funciones con `SECURITY DEFINER`
- `SET search_path = public`
- Verificación de permisos

---

## 🗄️ Tablas Creadas

### 1. `user_roles`
```sql
id UUID PRIMARY KEY (references auth.users)
role VARCHAR(20) DEFAULT 'user' - admin, moderator, user
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 2. `onboarding_status`
```sql
id UUID PRIMARY KEY
step_completed INT (0-5)
profile_completed BOOLEAN
bio_completed BOOLEAN
interests_completed BOOLEAN
follow_suggested_completed BOOLEAN
tutorial_completed BOOLEAN
completed_at TIMESTAMP
```

### 3. `user_interests`
```sql
id BIGSERIAL PRIMARY KEY
user_id UUID (references auth.users)
interest VARCHAR(50)
created_at TIMESTAMP
```

### 4. `admin_logs`
```sql
id BIGSERIAL PRIMARY KEY
admin_id UUID
action VARCHAR(100)
target_user_id UUID
details JSONB
ip_address VARCHAR(45)
created_at TIMESTAMP
```

### 5. `user_reports`
```sql
id BIGSERIAL PRIMARY KEY
reported_by UUID
reported_user_id UUID
reason VARCHAR(100)
description TEXT
status VARCHAR(20) - pending, reviewing, resolved, dismissed
resolved_by UUID
resolution_notes TEXT
created_at TIMESTAMP
resolved_at TIMESTAMP
```

### 6. `moderation_actions`
```sql
id BIGSERIAL PRIMARY KEY
user_id UUID
action_type VARCHAR(50) - warn, suspend, ban, shadow_ban
duration_days INT
reason TEXT
created_by UUID
created_at TIMESTAMP
expires_at TIMESTAMP
```

---

## 📡 Funciones SQL Disponibles

### Funciones de Seguridad

```sql
-- Obtener rol del usuario
get_user_role(p_user_id UUID) -> VARCHAR

-- Verificar si es admin
is_admin(p_user_id UUID) -> BOOLEAN

-- Verificar si es moderador
is_moderator(p_user_id UUID) -> BOOLEAN
```

### Funciones de Onboarding

```sql
-- Obtener progreso
get_onboarding_progress(p_user_id UUID) -> TABLE

-- Actualizar paso
update_onboarding_step(p_user_id UUID, p_step INT)

-- Completar perfil
complete_profile_step(p_user_id UUID)

-- Agregar intereses
add_user_interests(p_user_id UUID, p_interests TEXT[])
```

### Funciones de Administración

```sql
-- Crear reporte
report_user(
  p_reported_by UUID,
  p_reported_user_id UUID,
  p_reason VARCHAR,
  p_description TEXT
) -> BIGINT

-- Crear acción de moderación
create_moderation_action(
  p_user_id UUID,
  p_action_type VARCHAR,
  p_duration_days INT,
  p_reason TEXT,
  p_created_by UUID
) -> BIGINT

-- Verificar si está baneado
is_user_banned(p_user_id UUID) -> BOOLEAN

-- Promover a admin
promote_to_admin(p_user_id UUID, p_promoted_by UUID)
```

---

## 🎨 Componentes React

### `Onboarding.jsx`
Componente de 3 pasos para onboarding:
- Step 0: Completar perfil
- Step 1: Seleccionar intereses
- Step 2: Sugerencias de usuarios

**Props:** Ninguna (usa auth del contexto)

**Usos:**
```jsx
import Onboarding from './components/Onboarding';

// En App.jsx, redirige aquí si !onboarding_completed
<Route path="/onboarding" element={<Onboarding />} />
```

### `AdminPanel.jsx`
Panel completo de administración con 3 tabs:
- Dashboard: Estadísticas
- Reports: Gestión de reportes
- Users: Gestión de usuarios

**Verificación:** Solo usuarios con rol `admin` pueden acceder.

**Usos:**
```jsx
import AdminPanel from './components/AdminPanel';

// En App.jsx
<Route path="/admin" element={<AdminPanel />} />
```

---

## 🔧 Instalación

### 1. Ejecutar SQL en Supabase
```
1. Ve a: https://app.supabase.com/project/[PROJECT_ID]/sql/new
2. Copia todo de: supabase/onboarding_admin_system.sql
3. Click "Run"
```

### 2. Agregar componentes a la app
```bash
# Ya están en:
src/components/Onboarding.jsx
src/components/AdminPanel.jsx
```

### 3. Agregar rutas en App.jsx
```jsx
import Onboarding from './components/Onboarding';
import AdminPanel from './components/AdminPanel';

// En el router:
<Route path="/onboarding" element={<Onboarding />} />
<Route path="/admin" element={<AdminPanel />} />
```

### 4. Crear primer admin
```sql
-- En Supabase SQL editor
SELECT promote_to_admin('TU_USER_ID_AQUI'::uuid, 'TU_USER_ID_AQUI'::uuid);
```

---

## 🛡️ Seguridad

### RLS Habilitado
- ✅ `user_roles` - Solo admins pueden actualizar
- ✅ `onboarding_status` - Solo el usuario puede actualizar
- ✅ `user_interests` - Solo el usuario puede gestionar
- ✅ `admin_logs` - Solo admins pueden ver
- ✅ `user_reports` - Solo moderadores pueden actualizar
- ✅ `moderation_actions` - Solo admins pueden crear

### Funciones Seguras
- Todas con `SECURITY DEFINER`
- Todas con `SET search_path = public`
- Verificación de permisos en cada función

### Triggers Automáticos
- Crear onboarding al registrarse
- Limpiar acciones expiradas

---

## 📊 Flujo de Onboarding

```
1. Usuario se registra
   ↓
2. Trigger crea:
   - user_roles (role = 'user')
   - onboarding_status (step_completed = 0)
   ↓
3. Redirige a /onboarding
   ↓
4. Step 0: Completar perfil
   - Guarda bio en profiles
   - Marca profile_completed = TRUE
   - step_completed = 1
   ↓
5. Step 1: Seleccionar intereses
   - Inserta en user_interests
   - Marca interests_completed = TRUE
   - step_completed = 2
   ↓
6. Step 2: Revisar y finalizar
   - Marca tutorial_completed = TRUE
   - step_completed = 5
   ↓
7. Redirige a /feed
```

---

## 🛠️ API Ejemplos

### Reportar usuario
```javascript
await supabase.rpc('report_user', {
  p_reported_by: currentUser.id,
  p_reported_user_id: targetUser.id,
  p_reason: 'Spam',
  p_description: 'Tiene muchos mensajes spam'
});
```

### Suspender usuario
```javascript
await supabase.rpc('create_moderation_action', {
  p_user_id: targetUser.id,
  p_action_type: 'suspend',
  p_duration_days: 7,
  p_reason: 'Violación de términos',
  p_created_by: currentUser.id
});
```

### Verificar si está baneado
```javascript
const { data: isBanned } = await supabase.rpc('is_user_banned', {
  p_user_id: user.id
});

if (isBanned) {
  // Redirigir a página de error
}
```

### Promover a admin
```javascript
await supabase.rpc('promote_to_admin', {
  p_user_id: targetUser.id,
  p_promoted_by: currentUser.id
});
```

---

## 📝 Checklist de Implementación

- [ ] Ejecutar SQL en Supabase
- [ ] Copiar componentes a `src/components/`
- [ ] Agregar rutas en `App.jsx`
- [ ] Crear primer admin con SQL
- [ ] Probar onboarding con usuario nuevo
- [ ] Probar panel admin
- [ ] Probar sistema de reportes
- [ ] Probar moderación

---

## ⚡ Quick Links

- 🔗 SQL Editor: https://app.supabase.com/project/jyfrjwyxlhfhenubrbpk/sql/new
- 🔗 Manage Users: https://app.supabase.com/project/jyfrjwyxlhfhenubrbpk/auth/users
- 🔗 Database: https://app.supabase.com/project/jyfrjwyxlhfhenubrbpk/editor
