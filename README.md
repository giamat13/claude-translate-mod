# claude-translate-mod

A Claude Code mod that lets you write in Hebrew. Each prompt is translated to English before it reaches Claude, and nothing else is added: no history, no extra context, no system prompt changes.

- On at every session start (change `DEFAULT_ON` in `hooks/register.tsx` to start off). Type commands alone on their line:
  - `/he on|off|status` turns both directions on or off (`/he` toggles).
  - `/he in on|off|status`: your Hebrew prompts are translated to English before Claude sees them.
  - `/he out on|off|status`: Claude's English replies are shown to you in Hebrew, paragraph by paragraph as they stream. The stored message can end up in Hebrew too, so use `/he orig` to see the English.
  - `/he mode haiku|argos|status`: `haiku` (default) translates with Haiku, with offline Argos as fallback. `argos` skips Haiku entirely and uses only the offline Argos translator; replies then stay English, because showing them in Hebrew needs Haiku. The choice is kept across sessions. The default is `DEFAULT_MODE` in `hooks/register.tsx`.
  - `/he orig`: the English original of Claude's latest reply.
- Translation: Haiku called with no history, no tools and a one-line system prompt. If that fails, an optional offline fallback (Argos Translate, he→en) runs locally.
- Lines without Hebrew and fenced code blocks are left as they are (fallback translator).
- Claude is told when a message was translated (one short line appended), and may read the original through the `mcp__he-to-en__original` tool, only if it must. For installers: Claude should not call that tool on every message or every turn, only when a message is truly unclear and the answer depends on it.

## Install

At the prompt of a terminal session:

```
/plugin install he-to-en --marketplace GIAMAT13/claude-translate-mod
```

From a shell:

```
claude plugin install he-to-en --marketplace GIAMAT13/claude-translate-mod
```

## Optional offline fallback

Needs Python 3.9–3.12. From the plugin folder:

```
python setup.py
```

This creates `.venv` and installs Argos Translate with the Hebrew→English model.

## Develop

```
claude plugin validate .
claude plugin test .
claude --plugin-dir .
```

## License

MIT, see [LICENSE](LICENSE).
