/** Forever release — 4 November 2026, 00:00 Moscow time. */
export const FOREVER_LAUNCH_AT = new Date('2026-11-04T00:00:00+03:00')

export interface CountdownParts {
  live: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function countdownParts(now = Date.now(), launchAt = FOREVER_LAUNCH_AT.getTime()): CountdownParts {
  const diff = launchAt - now
  if (diff <= 0) {
    return { live: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { live: false, days, hours, minutes, seconds }
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function formatCountdown(parts: CountdownParts): string {
  if (parts.live) return ''
  if (parts.days > 0) {
    return `${parts.days}d ${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
  }
  return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
}
