# How Developers Use Obsidian for Learning

#obsidian #learning #workflow

The pattern that actually works, stripped of the rabbit holes.

---

## The core idea: one note per concept, not per project

Don't make a note called "FlipWeather stuff I learned."
Make notes called `async-await.md`, `es-modules.md`, `javascript-event-loop.md`.

Why: concepts recur across projects. If you learn async/await on FlipWeather, that note becomes useful when you hit it again on a completely different project. Project-scoped notes die when the project does. Concept-scoped notes compound.

---

## When to write a note

**After** something clicks, not before. The act of writing it *is* the learning.

The note doesn't need to be complete or correct. It needs to be yours. One or two sentences in your own words plus a code snippet is enough. You're writing an anchor for your future self, not a tutorial for a stranger.

Bad timing: writing notes while confused, hoping to figure it out by writing.
Good timing: right after the "oh *that's* what that means" moment.

---

## What to put in each note

```markdown
# async/await

The modern way to handle things that take time (API calls, file reads, etc.)
Instead of nested callbacks, it reads top to bottom like normal code.

await = "pause here until this finishes, then continue"
async = "this function contains awaits, handle it accordingly"

## In Flash terms
Like an event callback but written so it reads sequentially.
Old way: addEventListener + handler function (nested, hard to follow)
New way: await (linear, reads like a recipe)

## Example
const data = await fetchWeather(lat, lon);  // waits here
console.log(data);                          // runs after fetch completes

## Related
[[javascript-event-loop]] — why JS can wait without freezing
[[promise-all]] — waiting for multiple things simultaneously
```

Short. Personal. Linked to related concepts.

---

## The wiki-link is the killer feature

`[[async-await]]` in any note creates a clickable link to `async-await.md`.
You don't need to create the target note first — just write the link and make the note later.

This is how the system grows organically: you write a note, you mention a concept you don't understand yet, you link it, and now you have a named placeholder to return to. The link is the reminder.

---

## What to ignore (at least at first)

- **The graph view** — looks cool, not useful until you have 50+ notes. Don't optimize for it.
- **Plugins** — there are thousands. Start with zero. Add one only when you feel a specific friction.
- **Templates** — only useful once you know what you keep repeating. Don't template prematurely.
- **Daily notes** — great for journaling workflows, overkill for a technical learning vault.
- **Folder hierarchies** — flat is fine. Tags + links do the organizing.

---

## The vibe-coding specific pattern

When you finish a session with an AI tool:

1. Open the vault
2. Find or create the concept notes for things that clicked
3. Add one sentence in your own words
4. Add a `[[link]]` to anything that didn't click yet
5. Close it

Five minutes. That's it. The compounding happens over weeks, not sessions.

The goal isn't a complete knowledge base. It's a web of anchors that let you re-enter a topic without starting from zero.

---

## The audience split

**Obsidian notes** → written for you, the human. Can be messy, personal, exploratory.
**Project memory files** (`.claude/memory/`) → written for the AI. Must be minimal, actionable.

These serve different readers. Writing the same thing in both is fine if it serves both purposes — but usually they diverge. The AI needs "start the server before writing files." You need "async/await finally clicked when I compared it to Flash event callbacks."
