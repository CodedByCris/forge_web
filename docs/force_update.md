# Feature: Actualización forzada

## Qué hace
El admin fija `minVersion` en `/cms/configuracion`. La app Android bloquea el uso (modal sin cierre) si su versión instalada es menor.

## Archivos principales
- `app/components/cms/config/ForceUpdateSection.vue`
- `app/stores/cms/config.store.ts` (`minVersion`, `saveMinVersion`)
- `app/services/cms/config.service.ts` (`updateMinVersion`)

## Firestore
`config/appConfig.minVersion` (string `X.Y.Z`). Vacío = desactivado.

## Decisiones técnicas
Sección dentro de Configuración (no existe `/cms/app`). Validación `X.Y.Z` en cliente.

## Pendientes / TODOs
- iOS no aplica.
