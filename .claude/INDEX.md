# Documentación — GymApp Web (/train)

Documentos para el proyecto Nuxt que implementa `/train`.

---

## Archivos

| Archivo | Contenido |
|---|---|
| `CLAUDE.md` | Contexto principal: stack, arquitectura, reglas de trabajo |
| `TYPES.md` | TypeScript interfaces y enums compartidos |
| `BACKEND.md` | Esquema Firestore + patrones de lectura/escritura web |
| `AUTH.md` | Feature login: Firebase Auth, store, UI, middleware |
| `WORKOUT.md` | Feature workout activo: draft, finalizar, historial |
| `TEMPLATES.md` | Feature plantillas: CRUD, UI, iniciar desde plantilla |
| `FEED.md` | Feature feed: posts, likes, reactions, comentarios |
| `SETTINGS.md` | Feature settings: perfil, cuenta, privacidad, objetivo |
| `FUNCTIONS.md` | Cloud Functions existentes relevantes para la web |

---

## Orden de implementación sugerido

1. **Auth** — login + middleware + Firebase init
2. **Templates** — más simple, sin estado complejo
3. **Workout** — activo + historial (depende de templates)
4. **Feed** — feed + likes + reacciones
5. **Settings** — perfil + cuenta

---

## Features en scope

- Login / logout
- Workout activo (desde cero o desde plantilla)
- Plantillas CRUD
- Feed social (posts, likes, reactions, comentarios)
- Settings (perfil, privacidad, contraseña, objetivo semanal)

## Features fuera de scope (MVP web)

- Registro de cuenta nueva
- Ranked Mode / duels
- AI Chat / generador de rutinas
- Tienda / mancuernitas
- Búsqueda de usuarios / seguir desde la web
- Notificaciones
- Subida de foto de perfil
- Estadísticas y progreso

---

## Proyecto Firebase

- **Nombre**: `gym-app-41fd6`
- **Backend compartido** con la app Flutter — misma Firestore, mismo Auth
- **No crear colecciones nuevas** — solo leer/escribir las existentes
