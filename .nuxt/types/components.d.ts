
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  AppFooter: typeof import("../../app/components/AppFooter.vue")['default']
  AppNavbar: typeof import("../../app/components/AppNavbar.vue")['default']
  AppShowcase: typeof import("../../app/components/AppShowcase.vue")['default']
  BetaModal: typeof import("../../app/components/BetaModal.vue")['default']
  BetaSection: typeof import("../../app/components/BetaSection.vue")['default']
  FeaturesSection: typeof import("../../app/components/FeaturesSection.vue")['default']
  HeroSection: typeof import("../../app/components/HeroSection.vue")['default']
  HowItWorks: typeof import("../../app/components/HowItWorks.vue")['default']
  RanksSection: typeof import("../../app/components/RanksSection.vue")['default']
  ScreenshotGallery: typeof import("../../app/components/ScreenshotGallery.vue")['default']
  AuthRegisterStep1: typeof import("../../app/components/auth/RegisterStep1.vue")['default']
  AuthRegisterStep2: typeof import("../../app/components/auth/RegisterStep2.vue")['default']
  AuthRegisterStep3: typeof import("../../app/components/auth/RegisterStep3.vue")['default']
  FeedCommentItem: typeof import("../../app/components/feed/CommentItem.vue")['default']
  FeedCommentSheet: typeof import("../../app/components/feed/CommentSheet.vue")['default']
  FeedEmptyState: typeof import("../../app/components/feed/EmptyState.vue")['default']
  FeedExercisePreview: typeof import("../../app/components/feed/ExercisePreview.vue")['default']
  FeedPostCard: typeof import("../../app/components/feed/PostCard.vue")['default']
  FeedPostHeader: typeof import("../../app/components/feed/PostHeader.vue")['default']
  FeedReactionBar: typeof import("../../app/components/feed/ReactionBar.vue")['default']
  FeedSkeletonCard: typeof import("../../app/components/feed/SkeletonCard.vue")['default']
  FeedWorkoutStats: typeof import("../../app/components/feed/WorkoutStats.vue")['default']
  LandingCtaSection: typeof import("../../app/components/landing/CtaSection.vue")['default']
  LandingSocialProof: typeof import("../../app/components/landing/SocialProof.vue")['default']
  LandingSponsorSection: typeof import("../../app/components/landing/SponsorSection.vue")['default']
  SettingsDeleteAccountDialog: typeof import("../../app/components/settings/DeleteAccountDialog.vue")['default']
  SettingsProfileSheet: typeof import("../../app/components/settings/ProfileSheet.vue")['default']
  SettingsToggleSwitch: typeof import("../../app/components/settings/ToggleSwitch.vue")['default']
  SharedToastContainer: typeof import("../../app/components/shared/ToastContainer.vue")['default']
  WorkoutAddExerciseModal: typeof import("../../app/components/workout/AddExerciseModal.vue")['default']
  WorkoutExerciseCard: typeof import("../../app/components/workout/ExerciseCard.vue")['default']
  WorkoutFeedbackModal: typeof import("../../app/components/workout/FeedbackModal.vue")['default']
  WorkoutSetRow: typeof import("../../app/components/workout/SetRow.vue")['default']
  WorkoutSetTypeSelector: typeof import("../../app/components/workout/SetTypeSelector.vue")['default']
  WorkoutStartWorkoutModal: typeof import("../../app/components/workout/StartWorkoutModal.vue")['default']
  WorkoutTemplateCard: typeof import("../../app/components/workout/TemplateCard.vue")['default']
  WorkoutTemplateExerciseRow: typeof import("../../app/components/workout/TemplateExerciseRow.vue")['default']
  WorkoutTemplateFormModal: typeof import("../../app/components/workout/TemplateFormModal.vue")['default']
  WorkoutTimer: typeof import("../../app/components/workout/WorkoutTimer.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAppFooter: LazyComponent<typeof import("../../app/components/AppFooter.vue")['default']>
  LazyAppNavbar: LazyComponent<typeof import("../../app/components/AppNavbar.vue")['default']>
  LazyAppShowcase: LazyComponent<typeof import("../../app/components/AppShowcase.vue")['default']>
  LazyBetaModal: LazyComponent<typeof import("../../app/components/BetaModal.vue")['default']>
  LazyBetaSection: LazyComponent<typeof import("../../app/components/BetaSection.vue")['default']>
  LazyFeaturesSection: LazyComponent<typeof import("../../app/components/FeaturesSection.vue")['default']>
  LazyHeroSection: LazyComponent<typeof import("../../app/components/HeroSection.vue")['default']>
  LazyHowItWorks: LazyComponent<typeof import("../../app/components/HowItWorks.vue")['default']>
  LazyRanksSection: LazyComponent<typeof import("../../app/components/RanksSection.vue")['default']>
  LazyScreenshotGallery: LazyComponent<typeof import("../../app/components/ScreenshotGallery.vue")['default']>
  LazyAuthRegisterStep1: LazyComponent<typeof import("../../app/components/auth/RegisterStep1.vue")['default']>
  LazyAuthRegisterStep2: LazyComponent<typeof import("../../app/components/auth/RegisterStep2.vue")['default']>
  LazyAuthRegisterStep3: LazyComponent<typeof import("../../app/components/auth/RegisterStep3.vue")['default']>
  LazyFeedCommentItem: LazyComponent<typeof import("../../app/components/feed/CommentItem.vue")['default']>
  LazyFeedCommentSheet: LazyComponent<typeof import("../../app/components/feed/CommentSheet.vue")['default']>
  LazyFeedEmptyState: LazyComponent<typeof import("../../app/components/feed/EmptyState.vue")['default']>
  LazyFeedExercisePreview: LazyComponent<typeof import("../../app/components/feed/ExercisePreview.vue")['default']>
  LazyFeedPostCard: LazyComponent<typeof import("../../app/components/feed/PostCard.vue")['default']>
  LazyFeedPostHeader: LazyComponent<typeof import("../../app/components/feed/PostHeader.vue")['default']>
  LazyFeedReactionBar: LazyComponent<typeof import("../../app/components/feed/ReactionBar.vue")['default']>
  LazyFeedSkeletonCard: LazyComponent<typeof import("../../app/components/feed/SkeletonCard.vue")['default']>
  LazyFeedWorkoutStats: LazyComponent<typeof import("../../app/components/feed/WorkoutStats.vue")['default']>
  LazyLandingCtaSection: LazyComponent<typeof import("../../app/components/landing/CtaSection.vue")['default']>
  LazyLandingSocialProof: LazyComponent<typeof import("../../app/components/landing/SocialProof.vue")['default']>
  LazyLandingSponsorSection: LazyComponent<typeof import("../../app/components/landing/SponsorSection.vue")['default']>
  LazySettingsDeleteAccountDialog: LazyComponent<typeof import("../../app/components/settings/DeleteAccountDialog.vue")['default']>
  LazySettingsProfileSheet: LazyComponent<typeof import("../../app/components/settings/ProfileSheet.vue")['default']>
  LazySettingsToggleSwitch: LazyComponent<typeof import("../../app/components/settings/ToggleSwitch.vue")['default']>
  LazySharedToastContainer: LazyComponent<typeof import("../../app/components/shared/ToastContainer.vue")['default']>
  LazyWorkoutAddExerciseModal: LazyComponent<typeof import("../../app/components/workout/AddExerciseModal.vue")['default']>
  LazyWorkoutExerciseCard: LazyComponent<typeof import("../../app/components/workout/ExerciseCard.vue")['default']>
  LazyWorkoutFeedbackModal: LazyComponent<typeof import("../../app/components/workout/FeedbackModal.vue")['default']>
  LazyWorkoutSetRow: LazyComponent<typeof import("../../app/components/workout/SetRow.vue")['default']>
  LazyWorkoutSetTypeSelector: LazyComponent<typeof import("../../app/components/workout/SetTypeSelector.vue")['default']>
  LazyWorkoutStartWorkoutModal: LazyComponent<typeof import("../../app/components/workout/StartWorkoutModal.vue")['default']>
  LazyWorkoutTemplateCard: LazyComponent<typeof import("../../app/components/workout/TemplateCard.vue")['default']>
  LazyWorkoutTemplateExerciseRow: LazyComponent<typeof import("../../app/components/workout/TemplateExerciseRow.vue")['default']>
  LazyWorkoutTemplateFormModal: LazyComponent<typeof import("../../app/components/workout/TemplateFormModal.vue")['default']>
  LazyWorkoutTimer: LazyComponent<typeof import("../../app/components/workout/WorkoutTimer.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
