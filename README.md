# CommitMsg

> Paste a git diff, get three Conventional Commits messages to choose from.

**[Live demo](https://commitmsg-mlx.vercel.app)**

Writing a good commit message means re-reading your own diff and deciding what the change actually was. CommitMsg does that read for you: paste the output of `git diff --staged`, and a Groq-hosted Llama 3.3 70B model returns three commit messages, each a different valid reading of the same changes — one might frame it as a `feat`, another as a `refactor`. The model is constrained to return strict JSON, so every option comes back with a type, a lowercase imperative subject under 72 characters, and an optional body.

## Features

- Three alternative commit messages per diff, each a distinct interpretation
- Conventional Commits types (`feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`, `ci`, `build`) rendered as color-coded badges
- One-click copy that assembles subject and body into a ready-to-paste message
- Live character counter that warns when a diff exceeds the 8,000-character limit sent to the model
- Markdown code-fence stripping so malformed model output still parses

## Stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- Groq Chat Completions API — `llama-3.3-70b-versatile`

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local`.

---

Part of a series of 91 small web apps. [Browse them all](https://lorenzoylosada.vercel.app).
