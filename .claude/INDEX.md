# Documentación — GymApp Web (/train)

Documentos para el proyecto Nuxt que implementa `/train` y las páginas públicas de marketing.

---

## Archivos

| Archivo | Contenido |
|---|---|
| `CLAUDE.md` | Contexto principal: stack, arquitectura, reglas de trabajo |
| `TYPES.md` | TypeScript interfaces y enums compartidos |
| `BACKEND.md` | Esquema Firestore + patrones de lectura/escritura web |
| `AUTH.md` | Feature auth: login + registro, Firebase Auth, store, UI, middleware |
| `WORKOUT.md` | Feature workout activo: draft, finalizar, historial |
| `TEMPLATES.md` | Feature plantillas: CRUD, UI, iniciar desde plantilla |
| `FEED.md` | Feature feed: posts, likes, reactions, comentarios |
| `SETTINGS.md` | Feature settings: perfil, cuenta, privacidad, objetivo |
| `FUNCTIONS.md` | Cloud Functions existentes relevantes para la web |
| `TODO_web.md` | Estado de implementación + BLOQUE 3 (Stats Dashboard) pendiente |

---

## Estado de features

| Feature | Ruta | Estado |
|---|---|---|
| Login | `/train/auth/login` | ✅ |
| Registro | `/train/auth/register` | ✅ |
| Dashboard home | `/train/` | ✅ |
| Workout activo | `/train/workout/[id]` | ✅ |
| Plantillas | `/train/templates/` | ✅ |
| Feed social | `/train/feed/` | ✅ |
| Settings | `/train/settings/` | ✅ |
| Landing pública | `/` | ✅ |
| Pricing | `/pricing` | ✅ |
| Stats dashboard | `/train/stats` | Pendiente |
| Historial web | `/train/history` | Pendiente |
| Records / PRs | `/train/records` | Pendiente |

---

## Features fuera de scope

- Ranked Mode / duels
- AI Chat / generador de rutinas
- Tienda / mancuernitas
- Búsqueda de usuarios / seguir desde la web
- Notificaciones push
- Subida de foto de perfil

---

## Proyecto Firebase

- **Nombre**: `gym-app-41fd6`
- **Backend compartido** con la app Flutter — misma Firestore, mismo Auth
- **No crear colecciones nuevas** — solo leer/escribir las existentes
