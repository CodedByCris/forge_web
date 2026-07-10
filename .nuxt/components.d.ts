
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


export const AppFooter: typeof import("../app/components/AppFooter.vue")['default']
export const AppNavbar: typeof import("../app/components/AppNavbar.vue")['default']
export const AppShowcase: typeof import("../app/components/AppShowcase.vue")['default']
export const BetaSection: typeof import("../app/components/BetaSection.vue")['default']
export const FeaturesSection: typeof import("../app/components/FeaturesSection.vue")['default']
export const HeroSection: typeof import("../app/components/HeroSection.vue")['default']
export const HowItWorks: typeof import("../app/components/HowItWorks.vue")['default']
export const RanksSection: typeof import("../app/components/RanksSection.vue")['default']
export const ScreenshotGallery: typeof import("../app/components/ScreenshotGallery.vue")['default']
export const FeedCommentItem: typeof import("../app/components/feed/CommentItem.vue")['default']
export const FeedCommentSheet: typeof import("../app/components/feed/CommentSheet.vue")['default']
export const FeedEmptyState: typeof import("../app/components/feed/EmptyState.vue")['default']
export const FeedExercisePreview: typeof import("../app/components/feed/ExercisePreview.vue")['default']
export const FeedPostCard: typeof import("../app/components/feed/PostCard.vue")['default']
export const FeedPostHeader: typeof import("../app/components/feed/PostHeader.vue")['default']
export const FeedReactionBar: typeof import("../app/components/feed/ReactionBar.vue")['default']
export const FeedSkeletonCard: typeof import("../app/components/feed/SkeletonCard.vue")['default']
export const FeedWorkoutStats: typeof import("../app/components/feed/WorkoutStats.vue")['default']
export const SettingsDeleteAccountDialog: typeof import("../app/components/settings/DeleteAccountDialog.vue")['default']
export const SettingsProfileSheet: typeof import("../app/components/settings/ProfileSheet.vue")['default']
export const SettingsToggleSwitch: typeof import("../app/components/settings/ToggleSwitch.vue")['default']
export const SharedToastContainer: typeof import("../app/components/shared/ToastContainer.vue")['default']
export const WorkoutAddExerciseModal: typeof import("../app/components/workout/AddExerciseModal.vue")['default']
export const WorkoutExerciseCard: typeof import("../app/components/workout/ExerciseCard.vue")['default']
export const WorkoutFeedbackModal: typeof import("../app/components/workout/FeedbackModal.vue")['default']
export const WorkoutSetRow: typeof import("../app/components/workout/SetRow.vue")['default']
export const WorkoutSetTypeSelector: typeof import("../app/components/workout/SetTypeSelector.vue")['default']
export const WorkoutStartWorkoutModal: typeof import("../app/components/workout/StartWorkoutModal.vue")['default']
export const WorkoutTemplateCard: typeof import("../app/components/workout/TemplateCard.vue")['default']
export const WorkoutTemplateExerciseRow: typeof import("../app/components/workout/TemplateExerciseRow.vue")['default']
export const WorkoutTemplateFormModal: typeof import("../app/components/workout/TemplateFormModal.vue")['default']
export const WorkoutTimer: typeof import("../app/components/workout/WorkoutTimer.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAppFooter: LazyComponent<typeof import("../app/components/AppFooter.vue")['default']>
export const LazyAppNavbar: LazyComponent<typeof import("../app/components/AppNavbar.vue")['default']>
export const LazyAppShowcase: LazyComponent<typeof import("../app/components/AppShowcase.vue")['default']>
export const LazyBetaSection: LazyComponent<typeof import("../app/components/BetaSection.vue")['default']>
export const LazyFeaturesSection: LazyComponent<typeof import("../app/components/FeaturesSection.vue")['default']>
export const LazyHeroSection: LazyComponent<typeof import("../app/components/HeroSection.vue")['default']>
export const LazyHowItWorks: LazyComponent<typeof import("../app/components/HowItWorks.vue")['default']>
export const LazyRanksSection: LazyComponent<typeof import("../app/components/RanksSection.vue")['default']>
export const LazyScreenshotGallery: LazyComponent<typeof import("../app/components/ScreenshotGallery.vue")['default']>
export const LazyFeedCommentItem: LazyComponent<typeof import("../app/components/feed/CommentItem.vue")['default']>
export const LazyFeedCommentSheet: LazyComponent<typeof import("../app/components/feed/CommentSheet.vue")['default']>
export const LazyFeedEmptyState: LazyComponent<typeof import("../app/components/feed/EmptyState.vue")['default']>
export const LazyFeedExercisePreview: LazyComponent<typeof import("../app/components/feed/ExercisePreview.vue")['default']>
export const LazyFeedPostCard: LazyComponent<typeof import("../app/components/feed/PostCard.vue")['default']>
export const LazyFeedPostHeader: LazyComponent<typeof import("../app/components/feed/PostHeader.vue")['default']>
export const LazyFeedReactionBar: LazyComponent<typeof import("../app/components/feed/ReactionBar.vue")['default']>
export const LazyFeedSkeletonCard: LazyComponent<typeof import("../app/components/feed/SkeletonCard.vue")['default']>
export const LazyFeedWorkoutStats: LazyComponent<typeof import("../app/components/feed/WorkoutStats.vue")['default']>
export const LazySettingsDeleteAccountDialog: LazyComponent<typeof import("../app/components/settings/DeleteAccountDialog.vue")['default']>
export const LazySettingsProfileSheet: LazyComponent<typeof import("../app/components/settings/ProfileSheet.vue")['default']>
export const LazySettingsToggleSwitch: LazyComponent<typeof import("../app/components/settings/ToggleSwitch.vue")['default']>
export const LazySharedToastContainer: LazyComponent<typeof import("../app/components/shared/ToastContainer.vue")['default']>
export const LazyWorkoutAddExerciseModal: LazyComponent<typeof import("../app/components/workout/AddExerciseModal.vue")['default']>
export const LazyWorkoutExerciseCard: LazyComponent<typeof import("../app/components/workout/ExerciseCard.vue")['default']>
export const LazyWorkoutFeedbackModal: LazyComponent<typeof import("../app/components/workout/FeedbackModal.vue")['default']>
export const LazyWorkoutSetRow: LazyComponent<typeof import("../app/components/workout/SetRow.vue")['default']>
export const LazyWorkoutSetTypeSelector: LazyComponent<typeof import("../app/components/workout/SetTypeSelector.vue")['default']>
export const LazyWorkoutStartWorkoutModal: LazyComponent<typeof import("../app/components/workout/StartWorkoutModal.vue")['default']>
export const LazyWorkoutTemplateCard: LazyComponent<typeof import("../app/components/workout/TemplateCard.vue")['default']>
export const LazyWorkoutTemplateExerciseRow: LazyComponent<typeof import("../app/components/workout/TemplateExerciseRow.vue")['default']>
export const LazyWorkoutTemplateFormModal: LazyComponent<typeof import("../app/components/workout/TemplateFormModal.vue")['default']>
export const LazyWorkoutTimer: LazyComponent<typeof import("../app/components/workout/WorkoutTimer.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
