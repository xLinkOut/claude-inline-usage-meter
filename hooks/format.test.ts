import { test, expect } from 'claude-code/testing'
import { format } from './register'

test('formats 5h and weekly with reset, ignores others', () => {
  const at = (iso: string) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
  const h5 = '2026-10-15T12:30:00Z', wk = '2026-10-16T08:00:00Z'
  expect(format([
    { kind: 'five_hour', percentUsed: 23.5, resetsAt: h5 },
    { kind: 'seven_day', percentUsed: 41, resetsAt: wk },
    { kind: 'spend_limit', percentUsed: 9 },
  ])).toBe(`5h 24% (${at(h5)}) · week 41%`)
  expect(format([{ kind: 'five_hour', percentUsed: 7 }])).toBe('5h 7%')
  expect(format([])).toBe('')
})

