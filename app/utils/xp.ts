import type { DraftExercise } from '~/types/workout'

export function levelFromXp(totalXp: number): number {
  return Math.floor(totalXp / 100)
}

export function xpProgress(totalXp: number): number {
  return (totalXp % 100) / 100
}

export function calculateWorkoutXp(params: {
  completedSets: number
  hasPr: boolean
  streakDays: number
}): { xp: number; coins: number } {
  const base = 50
  const streakBonus = Math.min(params.streakDays, 7)
  const xp = base + streakBonus
  const coins = 10 + (params.hasPr ? 5 : 0)
  return { xp, coins }
}

/** "1h 23m" or "45m" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** "01:23" or "1:23:45" */
export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${String(h).padStart(2, '0')}:${mm}:${ss}`
  return `${mm}:${ss}`
}

/** Sum of weight × reps for all completed standard/assistedBody sets */
export function calcTotalVolumeKg(exercises: DraftExercise[]): number {
  return exercises.reduce((total, ex) => {
    if (ex.exerciseType !== 'standard' && ex.exerciseType !== 'assistedBody') return total
    return (
      total +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0)
    )
  }, 0)
}
