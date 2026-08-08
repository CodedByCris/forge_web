# Remove /train, Add /cms Placeholder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the entire `/train` private zone (workout, templates, feed, settings, login, and all its data layer) from the Nuxt web app on branch `main`, and add a `/cms` placeholder page showing "Hola mundo".

**Architecture:** Pure deletion of files under `app/pages/train/`, `app/layouts/train.vue`, `app/middleware/auth.ts`, the `workout/feed/settings` component folders, `app/components/shared/ToastContainer.vue`, `app/composables/useToast.ts`, all Pinia stores, all Firebase services, all domain types, and `app/plugins/02.auth.client.ts`. One dangling link (`AppNavbar.vue`) is edited to drop the now-broken `/train` nav item. `nuxt.config.ts` loses the `/train/**` route rule. Finally, a new minimal page `app/pages/cms/index.vue` is added.

**Tech Stack:** Nuxt 3 (Vue 3 Composition API), Pinia, Firebase SDK, Tailwind CSS, TypeScript.

**Note on testing:** Per this repo's CLAUDE.md ("Sin tests — misma regla que la app móvil"), there is no test suite. Verification steps use `npm run build` (Nuxt's type-checked production build) instead of a test runner — this repo's standard way of catching broken imports/types.

---

### Task 1: Delete `/train` pages, layout, and middleware

**Files:**
- Delete: `app/pages/train/index.vue`
- Delete: `app/pages/train/auth/login.vue`
- Delete: `app/pages/train/workout/active.vue`
- Delete: `app/pages/train/workout/[id].vue`
- Delete: `app/pages/train/workout/history.vue`
- Delete: `app/pages/train/templates/index.vue`
- Delete: `app/pages/train/feed/index.vue`
- Delete: `app/pages/train/settings/index.vue`
- Delete: `app/layouts/train.vue`
- Delete: `app/middleware/auth.ts`

- [ ] **Step 1: Delete the files**

```bash
git rm -r app/pages/train
git rm app/layouts/train.vue
git rm app/middleware/auth.ts
```

- [ ] **Step 2: Confirm no page files remain under train**

```bash
find app/pages/train app/layouts/train.vue app/middleware/auth.ts 2>&1
```

Expected: every path reported as "No such file or directory".

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
remove: delete /train pages, layout, and auth middleware
EOF
)"
```

---

### Task 2: Delete workout/feed/settings components and shared toast

**Files:**
- Delete: `app/components/workout/AddExerciseModal.vue`
- Delete: `app/components/workout/ExerciseCard.vue`
- Delete: `app/components/workout/FeedbackModal.vue`
- Delete: `app/components/workout/SetRow.vue`
- Delete: `app/components/workout/SetTypeSelector.vue`
- Delete: `app/components/workout/StartWorkoutModal.vue`
- Delete: `app/components/workout/TemplateCard.vue`
- Delete: `app/components/workout/TemplateExerciseRow.vue`
- Delete: `app/components/workout/TemplateFormModal.vue`
- Delete: `app/components/workout/WorkoutTimer.vue`
- Delete: `app/components/feed/CommentItem.vue`
- Delete: `app/components/feed/CommentSheet.vue`
- Delete: `app/components/feed/EmptyState.vue`
- Delete: `app/components/feed/ExercisePreview.vue`
- Delete: `app/components/feed/PostCard.vue`
- Delete: `app/components/feed/PostHeader.vue`
- Delete: `app/components/feed/ReactionBar.vue`
- Delete: `app/components/feed/SkeletonCard.vue`
- Delete: `app/components/feed/WorkoutStats.vue`
- Delete: `app/components/settings/DeleteAccountDialog.vue`
- Delete: `app/components/settings/ProfileSheet.vue`
- Delete: `app/components/settings/ToggleSwitch.vue`
- Delete: `app/components/shared/ToastContainer.vue`
- Delete: `app/composables/useToast.ts`

These are only ever imported from files deleted in Task 1 (confirmed: `useToast`/`ToastContainer` had no consumers outside `/train`; the `workout/feed/settings` component folders had no consumers outside `/train`).

- [ ] **Step 1: Delete the directories and composable**

```bash
git rm -r app/components/workout app/components/feed app/components/settings
git rm app/components/shared/ToastContainer.vue
git rm app/composables/useToast.ts
```

- [ ] **Step 2: Confirm nothing outside the deleted set still references them**

```bash
grep -rn "useToast\|ToastContainer\|components/workout\|components/feed\|components/settings" app --include=*.vue --include=*.ts 2>/dev/null
```

Expected: no output (empty).

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
remove: delete workout/feed/settings components and toast composable
EOF
)"
```

---

### Task 3: Delete Pinia stores, Firebase services, and domain types

**Files:**
- Delete: `app/stores/active-workout.store.ts`
- Delete: `app/stores/auth.store.ts`
- Delete: `app/stores/feed.store.ts`
- Delete: `app/stores/template.store.ts`
- Delete: `app/services/auth.service.ts`
- Delete: `app/services/exercise.service.ts`
- Delete: `app/services/feed.service.ts`
- Delete: `app/services/profile.service.ts`
- Delete: `app/services/template.service.ts`
- Delete: `app/services/workout.service.ts`
- Delete: `app/services/xp.service.ts`
- Delete: `app/types/auth.ts`
- Delete: `app/types/exercise.ts`
- Delete: `app/types/feed.ts`
- Delete: `app/types/template.ts`
- Delete: `app/types/user.ts`
- Delete: `app/types/workout.ts`

- [ ] **Step 1: Delete the directories**

```bash
git rm -r app/stores app/services app/types
```

- [ ] **Step 2: Confirm nothing outside these directories imports them**

```bash
grep -rn "useAuthStore\|useActiveWorkoutStore\|useFeedStore\|useTemplateStore\|from '~/services/\|from '~/types/" app 2>/dev/null
```

Expected: no output (empty) — everything that used these was already deleted in Tasks 1-2.

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
remove: delete Pinia stores, Firebase services, and domain types
EOF
)"
```

---

### Task 4: Delete the auth plugin and clean up nuxt.config.ts

**Files:**
- Delete: `app/plugins/02.auth.client.ts`
- Modify: `nuxt.config.ts`

`app/plugins/02.auth.client.ts` only calls `useAuthStore()`, which no longer exists after Task 3. `app/plugins/01.firebase.client.ts` is untouched — it only initializes the Firebase app with no dependency on anything deleted, and the CMS will need it later.

- [ ] **Step 1: Delete the plugin**

```bash
git rm app/plugins/02.auth.client.ts
```

- [ ] **Step 2: Remove the `/train` route rule from `nuxt.config.ts`**

Current (lines 33-36):
```typescript
  // /train is a client-side SPA (Firebase Auth — no SSR)
  routeRules: {
    '/train/**': { ssr: false },
  },

```

New: delete that block entirely, so the file reads:
```typescript
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  imports: {
    dirs: ['stores'],
  },

  vite: {
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
  },

  // Static site generation — no Node server needed on Hostinger
  nitro: {
    preset: 'static',
  },

  css: ['~/assets/css/main.css'],
```

(everything below `css:` stays as-is)

- [ ] **Step 3: Commit**

```bash
git add nuxt.config.ts
git commit -m "$(cat <<'EOF'
remove: delete auth plugin and /train route rule
EOF
)"
```

---

### Task 5: Drop the dangling `/train` nav link in AppNavbar

**Files:**
- Modify: `app/components/AppNavbar.vue`

Current file (36 lines):
```vue
<template>
  <header class="sticky top-0 z-50 bg-forge-bg/80 backdrop-blur-md border-b border-forge-divider/60">
    <nav class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="text-gradient-orange font-black text-xl tracking-tight select-none">
        FORGE
      </NuxtLink>

      <!-- Links -->
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="route.path === '/'
            ? 'text-forge-text bg-forge-surface'
            : 'text-forge-muted hover:text-forge-text hover:bg-forge-surface/60'"
        >
          Inicio
        </NuxtLink>
        <NuxtLink
          to="/train"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="route.path.startsWith('/train')
            ? 'text-forge-primary bg-forge-primary/10'
            : 'text-forge-muted hover:text-forge-text hover:bg-forge-surface/60'"
        >
          Entrenar
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
```

- [ ] **Step 1: Remove the "Entrenar" `NuxtLink` block (lines 20-28)**

Remove this block:
```vue
        <NuxtLink
          to="/train"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="route.path.startsWith('/train')
            ? 'text-forge-primary bg-forge-primary/10'
            : 'text-forge-muted hover:text-forge-text hover:bg-forge-surface/60'"
        >
          Entrenar
        </NuxtLink>
```

Resulting `<template>`:
```vue
<template>
  <header class="sticky top-0 z-50 bg-forge-bg/80 backdrop-blur-md border-b border-forge-divider/60">
    <nav class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="text-gradient-orange font-black text-xl tracking-tight select-none">
        FORGE
      </NuxtLink>

      <!-- Links -->
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="route.path === '/'
            ? 'text-forge-text bg-forge-surface'
            : 'text-forge-muted hover:text-forge-text hover:bg-forge-surface/60'"
        >
          Inicio
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
```

- [ ] **Step 2: Confirm no `/train` references remain anywhere in the app**

```bash
grep -rn "/train" app 2>/dev/null
```

Expected: no output (empty).

- [ ] **Step 3: Commit**

```bash
git add app/components/AppNavbar.vue
git commit -m "$(cat <<'EOF'
remove: drop dangling /train nav link from AppNavbar
EOF
)"
```

---

### Task 6: Add the `/cms` placeholder page

**Files:**
- Create: `app/pages/cms/index.vue`

- [ ] **Step 1: Create the placeholder page**

```vue
<template>
  <div class="min-h-screen bg-forge-bg text-forge-text flex items-center justify-center">
    <p class="text-2xl font-bold">Hola mundo</p>
  </div>
</template>
```

No `<script>` block needed — this is a static placeholder with no logic, no auth middleware, and uses the `default` layout (no `definePageMeta` needed).

- [ ] **Step 2: Commit**

```bash
git add app/pages/cms/index.vue
git commit -m "$(cat <<'EOF'
feat: add /cms placeholder page
EOF
)"
```

---

### Task 7: Verify the build

**Files:** none (verification only)

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Expected: build completes with no type errors, no "Cannot find module" / unresolved import errors, and no warnings about missing `useAuthStore`, `useToast`, or any deleted store/service/type.

- [ ] **Step 2: Manually spot-check with the dev server**

```bash
npm run dev
```

Then in a browser:
- Visit `/` — confirm it loads, the navbar shows only "Inicio" (no "Entrenar"), and there is no broken link to `/train`.
- Visit `/train` (or any sub-route like `/train/workout/active`) — confirm it 404s (the route no longer exists).
- Visit `/cms` — confirm it shows "Hola mundo".

Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 3: No commit needed for this task** (verification only — if issues are found, fix them in the relevant earlier task's files and amend that task's commit or add a small fix commit)
