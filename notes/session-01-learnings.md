# FlipWeather — Session 1 Learnings

#vibe-coding #javascript #learning

---

## What I built

A live weather dashboard that displays on a split-flap board animation.
Forked from flipoff (magnum6actual), wired up to Open-Meteo and Nominatim.
First real project using Claude Code. First time writing any JS in years.

Live: https://github.com/alabut/flipweather

---

## Things that clicked

**The Flash parallel is real.**
`getElementById` = grabbing an instance off the timeline.
`addEventListener` = addEventListener (AS3 had this, same name).
Class files like `Board.js`, `Tile.js` = display objects with their own methods.
The muscle memory is still there. It just needed dusting off.

**Why you can't just open index.html.**
ES modules (the `import` statement) don't work over `file://` URLs.
Browser security — it doesn't trust local files to load other local files.
Fix: run a tiny local server (`python3 -m http.server 9090`).
This is only a local dev problem. Once deployed anywhere it just works.

**ES = ECMAScript. Yes, same as ActionScript.**
AS3 and modern JS are both ECMAScript variants. The instinct was right.
ES6 (2015) finally added a proper module system — 20 years late.
Before that, frameworks like React used bundlers (Webpack) to fake it.

**Bundlers exist because ES modules didn't.**
React (2013) predated ES modules being usable.
Webpack/Browserify: write imports in source, run a build step, browser gets one big file.
This is why npm/Node.js exploded — the bundler had to run somewhere.
Even today most React projects use bundlers (now usually Vite) out of inertia.
FlipWeather skips all of that because it has no npm dependencies.

**I fixed two bugs myself.**
- Added `locationBtn.textContent = 'Detecting location...'` after click
- Added `locationBtn.textContent = 'Try Again'` in the error handler
- Cleared the red error text on success with `locationStatus.textContent = ''`
Pattern: once you have an element via `getElementById`, you can read/write
any of its properties. `disabled`, `textContent`, `classList` — all fair game.

**The main.js structure makes sense now.**
- Import statements at top = AS3 package imports
- `getElementById` calls = grabbing objects off the Flash timeline
- `addEventListener` = same as AS3, same name even
- The class files (Board.js, Tile.js) = display objects with timelines and methods

---

## Things that didn't click yet

**async/await.**
I can read it in plain English but I can't *see* it yet when I look at the code.
Claude described it as: "go do this thing that takes a while, come back when done."
In Flash terms: like an event callback but written so it reads top-to-bottom.
The old way (callbacks/events) was more verbose and nested — async/await flattens it.
Return here when it clicks. [[async-await]]

**The event loop.**
JS only does one thing at a time but *feels* concurrent. How?
Related to async/await. Worth a dedicated session. [[javascript-event-loop]]

---

## Questions to come back to

- What exactly is the event loop and why does JS only do one thing at a time?
- When would I actually need a bundler vs just using ES modules directly?
- What makes React useful vs just vanilla JS for something bigger?
- How does `Promise.all` work — why does it wait for ALL of them?

---

## Workflow notes

- Claude Code is launched from the project folder — that's its home base
- Memory files in `.claude/` = notes for the AI (keep minimal and actionable)
- This vault = notes for me (can be messy, personal, exploratory)
- These are different audiences. Not duplication.
- The preview tool has an ES module cache quirk — real users don't see it
- `Cmd+Shift+R` = hard refresh to bypass browser cache during dev
