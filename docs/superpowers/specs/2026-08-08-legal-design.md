# Legal (Política de Privacidad + Términos de Servicio) — CMS + Backend + Portada + App móvil

## Contexto

Cuarto sub-proyecto del CMS. A diferencia de FAQ (lista libre de documentos)
y Usuarios (colección ya existente), este toca **cuatro** superficies: CMS
(`forge_web`), portada pública (`forge_web`, nueva), Firestore rules
(`forge`), y app móvil (`forge`, Flutter) — la app móvil no tiene ninguna
pantalla legal todavía (verificado: no hay ninguna referencia a política de
privacidad/términos en `settings_screen.dart` ni en ningún otro sitio).

Referencia real usada: el ecosistema `Huby` (CMS + app Flutter en
producción) ya resuelve exactamente este problema — **no con un editor
WYSIWYG**, sino con un `<textarea>` monoespaciado donde se pega HTML crudo a
mano (`h2`/`h3`/`p`/`ul`/`li`/`strong`), renderizado con `v-html` + CSS en
la web y con el paquete `flutter_html` en la app. Se replica ese patrón
exacto, pero con la arquitectura de capas ya establecida en cada repo (no la
de Huby): `services/stores/pages` en `forge_web`, Clean Architecture +
Riverpod en `forge` (mismo patrón que `features/faq`).

## Decisiones (confirmadas con el usuario)

- **Contenido HTML crudo pegado a mano**, no editor WYSIWYG. Mismo patrón
  que `Huby-CMS`.
- **Dos documentos con ID fijo**, no una colección de items libres:
  `privacy_policy` y `terms_of_service`. No hay "crear" ni "borrar" — solo
  editar. Los documentos se crean implícitamente (`setDoc` con
  `merge: true`) la primera vez que se guardan desde el CMS.
- **Contenido inicial vacío.** El usuario pega el contenido real (por
  ejemplo desde su web externa actual) desde el CMS él mismo, en otro
  momento — no se inventa ni se migra contenido legal automáticamente (a
  diferencia de las FAQ, que sí se generaron con contenido de ejemplo con
  sentido). Estado "Aún no publicado" mientras `contentHtml` esté vacío.
- **Vista pública nueva en `forge_web`**: `/legal/privacidad` y
  `/legal/terminos`, sin login, sin el layout `cms`. Resuelve el requisito
  de Play Store de una URL pública de política de privacidad, reemplazando
  la web externa que el usuario tiene ahora mismo.
- **App móvil**: nueva sección "Legal" en Ajustes (entre "Soporte" y "Acerca
  de", incluyendo `settings_screen.dart:206-243` como referencia de
  posición), con dos filas que navegan a una pantalla genérica
  `LegalDocumentScreen`.
- **Nueva dependencia en `forge`**: `flutter_html: ^3.0.0` — misma versión
  ya validada en producción en la app `Huby`. Única dependencia nueva en
  todo este trabajo (ni `forge_web` ni el resto de `forge` necesitan nada
  nuevo).
- **Commits**: autorizados en `forge_web` (como en FAQ/Usuarios). **No
  autorizados en `forge`** (rules ni Flutter) — queda en el working tree.

## Esquema Firestore y rules

```typescript
// legal_documents/{docId}   — docId literal: 'privacy_policy' | 'terms_of_service'
{
  contentHtml: string   // '' hasta la primera publicación
  version: number        // empieza en 1, se incrementa en cada guardado
  updatedAt: Timestamp
}
```

Bloque nuevo en `forge/firestore.rules` (no modifica nada existente):

```javascript
match /legal_documents/{docId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

## CMS (`forge_web`) — `/cms/legal`

```
app/
  types/cms/legal.ts             # CmsLegalDocument, CmsLegalDocumentId ('privacy_policy' | 'terms_of_service')
  services/cms/legal.service.ts  # getLegalDocuments, saveLegalDocument
  stores/cms/legal.store.ts
  components/cms/legal/
    LegalDocumentCard.vue
    LegalFormModal.vue
  pages/cms/legal/
    index.vue
```

- Página con **dos tarjetas fijas** (una por documento, no una lista
  dinámica): nombre del documento, versión actual (o "Aún no publicado" si
  `contentHtml === ''`), fecha de última actualización, botón "Editar".
- `LegalFormModal.vue`: un `<textarea>` monoespaciado (`font-mono`) con nota
  explicando qué etiquetas soporta, botón "Publicar cambios". Sin borrado ni
  activar/desactivar — no aplican aquí.
- Sidebar: "Legal" deja de estar en `comingSoon`, pasa a `NuxtLink` real a
  `/cms/legal` (mismo patrón ya usado con "Usuarios" y "FAQ").

## Portada pública (`forge_web`) — nuevo

```
app/pages/legal/
  privacidad.vue
  terminos.vue
```

- Sin `definePageMeta` en absoluto (verificado: `app/pages/index.vue`
  tampoco lo usa) — Nuxt aplica `layouts/default.vue` automáticamente,
  mismo layout que la portada.
- Fetch directo del documento correspondiente desde Firestore (client SDK,
  igual que el resto de la portada), renderizado con `v-html` dentro de un
  contenedor con estilos que dan formato a `h2/h3/p/ul/li/strong` (mismo
  enfoque que la vista pública de `Huby-CMS`, adaptado a la paleta
  `forge.*`).
- Estado "Este documento aún no ha sido publicado" si `contentHtml` está
  vacío.

## App móvil (Flutter) — Clean Architecture + Riverpod

Mismo patrón que `features/faq`, con un `enum` en vez de lista abierta:

```
lib/features/legal/
  domain/
    entities/legal_document_entity.dart   # incluye el enum LegalDocumentType { privacyPolicy, termsOfService } con firestoreId
    repositories/legal_repository.dart
  data/
    datasources/legal_firestore_datasource.dart
    repositories/legal_repository_impl.dart
  presentation/
    providers/legal_providers.dart         # FutureProvider.autoDispose.family<LegalDocumentEntity, LegalDocumentType>
    screens/legal_document_screen.dart      # genérica, recibe título + tipo, usa Html() de flutter_html
```

- `LegalDocumentScreen` reutilizable para ambos documentos (recibe `title` y
  `documentType`), igual que el patrón real ya probado en la app `Huby`.
- Nueva sección "Legal" en `settings_screen.dart`, entre "Soporte" y "Acerca
  de": `SettingsSectionLabel` + `SettingsGroup` con dos `SettingsTile`
  ("Política de privacidad", "Términos de servicio"), mismo estilo que las
  secciones vecinas.
- Claves i18n nuevas en ambos `.arb` (ES/EN):
  `settingsSectionLegal`, `settingsLegalPrivacyPolicy`,
  `settingsLegalTermsOfService` — títulos de UI, no contenido, así que sí
  llevan traducción real (igual criterio que se aplicó a `faqTitle`).
- `pubspec.yaml`: añadir `flutter_html: ^3.0.0`.

## Manejo de errores

- **CMS**: fetch falla → `EmptyState` con mensaje + reintentar. Guardar
  falla → mensaje inline en el modal (mismo patrón que `FaqFormModal`).
- **Portada pública**: fetch falla → mensaje de error simple, sin diseño
  elaborado (página pública minimalista). Documento vacío → mensaje "Aún no
  publicado", no una página en blanco.
- **App móvil**: `legalDocumentProvider(type)` en error → mensaje "No se
  pudo cargar el documento. Inténtalo de nuevo más tarde." (mismo texto que
  ya usa `Huby`, sin necesidad de inventar uno nuevo). Documento vacío → el
  HTML vacío simplemente no renderiza nada visible; no hace falta un estado
  especial aquí porque no se espera que el usuario llegue a esta pantalla
  antes de que el usuario (admin) haya publicado contenido real — pero se
  revisa al implementar si conviene un mensaje explícito también aquí por
  consistencia con la portada web.

## Fuera de alcance

- Editor WYSIWYG (deliberadamente descartado, ver Decisiones).
- Migración de contenido desde la web externa actual (el usuario lo hará él
  mismo desde el CMS).
- Versionado histórico navegable (se guarda `version` como número, pero no
  se construye una vista de "ver versión anterior").
- Aviso legal / cookies / otros documentos — solo privacidad y términos,
  tal como se pidió.

## Verificación

- `forge_web`: `npm run generate` sin errores; `/cms/legal` edita ambos
  documentos correctamente; `/legal/privacidad` y `/legal/terminos` públicas
  muestran "Aún no publicado" antes de editar, y el HTML real después.
- `forge/firestore.rules`: dry-run limpio, deploy, lectura anónima
  funciona, escritura anónima rechazada (mismo patrón de verificación que
  FAQ).
- `forge` (Flutter): `flutter analyze` sin errores nuevos; nueva sección
  "Legal" visible en Ajustes; cada pantalla muestra el HTML real tras
  publicarlo desde el CMS, con el mismo formato visual (títulos, párrafos,
  listas, negritas) que en la web.
