import type { Register } from 'claude-code'

const HEB = /[֐-׿]/
const MARK = '\n[auto-translated from Hebrew; original via mcp__he-to-en__original only if needed]'
const TOOL = 'mcp__he-to-en__original'

async function mark($: any, orig: string, en: string) {
  const list = (((await $.store.get('orig')) as string[] | undefined) ?? []).concat(orig).slice(-20)
  await $.store.set('orig', list)
  return en + MARK
}

// Offline fallback: translate.py inside the plugin's own virtualenv (made by `python setup.py`).
async function argos($: any, text: string): Promise<string | null> {
  const root: string = $.plugin.root
  for (const py of [`${root}/.venv/Scripts/python.exe`, `${root}/.venv/bin/python`]) {
    try {
      const r = await $.process.run([py, '-I', `${root}/translate.py`], { stdin: text, timeoutMs: 120000 })
      if (r.exitCode === 0 && r.stdout.trim()) return r.stdout.trim()
    } catch {}
  }
  return null
}

export const register: Register = (on) => {
  // Off at every session start: the person turns it on with /he.
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'he', description: 'Hebrew->English translation of prompts: /he on | off | status' })
    await $.store.set('on', false)
    await $.tool.register({
      name: 'original',
      description:
        'Returns the original Hebrew text of the latest auto-translated user message(s). Use only if the translation is unclear.',
      inputSchema: { type: 'object', properties: { n: { type: 'number', description: 'how many recent messages, default 1' } } },
      isDeferred: false,
    })
    return next(e)
  })

  // @ts-ignore deep generic instantiation
  on('tool.call', { tool: TOOL }, async ($: any, e: any) => {
    const list = ((await $.store.get('orig')) as string[] | undefined) ?? []
    const n = Math.max(1, Math.min(10, Number(e.input?.n ?? 1)))
    return { result: { text: list.slice(-n).join('\n---\n') || 'none' } }
  })

  on('command.run', { command: 'he' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    let isOn = (await $.store.get('on')) === true
    if (arg === 'on') isOn = true
    else if (arg === 'off') isOn = false
    else if (arg !== 'status') isOn = !isOn
    await $.store.set('on', isOn)
    return { text: isOn ? 'Hebrew->English translation: ON' : 'Hebrew->English translation: OFF' }
  })

  on('prompt.submit', async ($, e, next) => {
    // Fallback in case the host passes "/he ..." as plain text instead of a command.
    const m = !e.command && /^\/he(?:\s+(on|off|status))?\s*$/i.exec(e.text.trim())
    if (m) {
      const arg = (m[1] ?? '').toLowerCase()
      let cur = (await $.store.get('on')) === true
      if (arg === 'on') cur = true
      else if (arg === 'off') cur = false
      else if (arg !== 'status') cur = !cur
      await $.store.set('on', cur)
      return { drop: cur ? 'he-to-en: translation ON' : 'he-to-en: translation OFF' }
    }
    if (e.command || e.isMeta || !HEB.test(e.text)) return next(e)
    if ((await $.store.get('on')) !== true) return next(e)

    // Haiku first: no history, no tools, one-line system prompt.
    try {
      const h = await $.model.complete({
        model: 'haiku',
        system: 'Translate to English. Output only the translation.',
        prompt: e.text,
        maxTokens: 2048,
        effort: 'low',
        timeoutMs: 20000,
      })
      if (h.isAnswered && h.text.trim()) {
        const en = h.text.trim()
        $.ui.toast(`EN: ${en.slice(0, 80)}`)
        return next({ ...e, text: await mark($, e.text, en) })
      }
    } catch {}

    const en = await argos($, e.text)
    if (en) {
      $.ui.toast(`EN: ${en.slice(0, 80)}`)
      return next({ ...e, text: await mark($, e.text, en) })
    }
    $.ui.toast('he-to-en: translation failed, sent as typed')
    return next(e)
  })
}
