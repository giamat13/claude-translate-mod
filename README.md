# claude-translate-mod

A Claude Code mod that lets you write in Hebrew. Each prompt is translated to English before it reaches Claude, and nothing else is added: no history, no extra context, no system prompt changes.

- Off at every session start. Turn it on with `/he on`, off with `/he off`, check with `/he status` (or `/he` to toggle). Type the command alone on its line.
- Translation: Haiku called with no history, no tools and a one-line system prompt. If that fails, an optional offline fallback (Argos Translate, he→en) runs locally.
- Lines without Hebrew and fenced code blocks are left as they are (fallback translator).
- Claude is told when a message was translated (one short line appended), and may read the original through the `mcp__he-to-en__original` tool, only if it must.

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
