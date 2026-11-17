import { expect, test } from 'claude-code/testing'

function engine(on: (n: any, h: any) => void, store: Record<string, unknown>) {
  on('store.get', (_: any, e: any) => ({ value: store[e.key] }))
  on('store.set', (_: any, e: any) => {
    store[e.key] = e.value
    return { value: undefined }
  })
  on('ui.toast', () => ({ value: undefined }))
  on('model.complete', () => ({ value: { isAnswered: true, text: 'Hello, fix the bug', usage: {} } }))
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

test('on: Hebrew is replaced by the translation', async ($, on) => {
  const store: Record<string, unknown> = { on: true }
  engine(on, store)
  const r: any = await $.prompt.submit({ text: 'שלום תקן את הבאג' } as any)
  expect(r.text).toContain('Hello, fix the bug')
  expect(r.text).toContain('auto-translated from Hebrew')
  expect(store.orig).toEqual(['שלום תקן את הבאג'])
})
