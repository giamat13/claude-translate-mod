import { expect, test } from 'claude-code/testing'

function engine(on: (n: any, h: any) => void, store: Record<string, unknown>, onComplete?: () => void) {
  on('store.get', (_: any, e: any) => ({ value: store[e.key] }))
  on('store.set', (_: any, e: any) => {
    store[e.key] = e.value
    return { value: undefined }
  })
  on('ui.toast', () => ({ value: undefined }))
  on('model.complete', () => {
    onComplete?.()
    return { value: { isAnswered: true, text: 'Hello, fix the bug', usage: {} } }
  })
  on('prompt.submit', (_: any, e: any) => ({ text: e.text }))
}

test('off: Hebrew passes through untouched', async ($, on) => {
  engine(on, { on: false })
  const r: any = await $.prompt.submit({ text: 'שלום תקן את הבאג' } as any)
  expect(r.text).toBe('שלום תקן את הבאג')
})

test('/he on is swallowed and turns translation on', async ($, on) => {
  const store: Record<string, unknown> = {}
  engine(on, store)
  const r: any = await $.prompt.submit({ text: '/he on' } as any)
  expect(r.drop).toBeTruthy()
  expect(store.on).toBe(true)
})

test('/he mode argos is saved and swallowed', async ($, on) => {
  const store: Record<string, unknown> = {}
  engine(on, store)
  const r: any = await $.prompt.submit({ text: '/he mode argos' } as any)
  expect(r.drop).toBeTruthy()
  expect(store.mode).toBe('argos')
})

test('argos mode: Hebrew prompts never reach Haiku', async ($, on) => {
  const store: Record<string, unknown> = { on: true, mode: 'argos' }
  let calls = 0
  engine(on, store, () => calls++)
  await $.prompt.submit({ text: 'שלום תקן את הבאג' } as any)
  expect(calls).toBe(0)
})

test('/he orig shows the English of the last reply', async ($, on) => {
  const store: Record<string, unknown> = { replies: ['First reply', 'Fix the bug, then run the tests'] }
  engine(on, store)
  const r: any = await $.prompt.submit({ text: '/he orig' } as any)
  expect(r.drop).toContain('Fix the bug, then run the tests')
})

test('on: Hebrew is replaced by the translation', async ($, on) => {
  const store: Record<string, unknown> = { on: true }
  engine(on, store)
  const r: any = await $.prompt.submit({ text: 'שלום תקן את הבאג' } as any)
  expect(r.text).toContain('Hello, fix the bug')
  expect(r.text).toContain('auto-translated from Hebrew')
  expect(store.orig).toEqual(['שלום תקן את הבאג'])
})
