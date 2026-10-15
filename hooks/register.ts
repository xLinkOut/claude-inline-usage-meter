import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import type { Limit as SessionRateLimit } from '../types'

const limits = atom({ plugin: 'usage-meter', key: 'limits' } as const, [] as SessionRateLimit[])

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: 'week' }
const pad = (n: number) => String(n).padStart(2, '0')

// reset time only for the 5h window: " (14:30)"
const resetAt = (l: SessionRateLimit) => {
  if (l.kind !== 'five_hour' || !l.resetsAt) return ''
  const d = new Date(l.resetsAt)
  return ` (${pad(d.getHours())}:${pad(d.getMinutes())})`
}

export const format = (ls: SessionRateLimit[]) =>
  ls
    .filter(l => l.kind in LABELS)
    .map(l => `${LABELS[l.kind]} ${Math.round(l.percentUsed)}%${resetAt(l)}`)
    .join(' · ')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const { rateLimits } = await $.session.usage()
    await update($, limits, () => rateLimits)
    return r
  })

  on('session.measure', async ($, e, next) => {
    await update($, limits, () => e.rateLimits)
    return next(e)
  })

  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const text = format(await read($, limits))
    return next(text ? { ...e, props: { ...e.props, modes: [...e.props.modes, text] } } : e)
  })
}
