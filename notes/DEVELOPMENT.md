# FlipWeather — Development Notes

This file is for humans and agents. If you're a future Claude Code session picking up this project, read this first. If you're the developer coming back after a break, same advice.

---

## Why This Project Exists

FlipWeather is a portfolio demo built in April 2026 to accompany a job application. The two goals were:

1. **Demonstrate Claude Code proficiency** — show that a designer/PM with rusty coding skills can ship something real using AI-assisted development
2. **Demonstrate technical range** — prove enough front-end competence to work alongside engineers, even without being a full-time developer

The thesis behind it: as of early 2026, "designers who code" are back in demand, and the relevant question is no longer "what languages do you know?" but "what's your AI stack?" This project is a concrete answer to that question.

It was built entirely in Claude Code across two sessions, starting from a fork of an existing open-source project.

---

## What It's Built On

FlipWeather is a fork of [magnum6actual/flipoff](https://github.com/magnum6actual/flipoff), a vanilla HTML/CSS/JS split-flap display web app. The original showed rotating inspirational quotes. FlipWeather replaces those with live local weather data.

**The original flipoff code that was kept unchanged:**
- `css/reset.css`, `css/board.css`, `css/tile.css`
- `js/Board.js`, `js/Tile.js`, `js/KeyboardController.js`, `js/SoundEngine.js`, `js/flapAudio.js`

**Everything else was rewritten or added.**

---

## What Was Built, In Order

### Session 1 — Core flipweather transformation

Starting from the flipoff baseline commit, all of the following were applied as a single commit:

**UI changes (`index.html`, `css/layout.css`, `css/responsive.css`):**
- Logo: "FlipOff." → "FlipWeather."
- Nav: removed Features/Pricing links, added single GitHub link
- Hero headline and subtitle rewritten for weather
- Email input + "Get Early Access" button → single "Enable Location" button
- Added `#location-status` element for error messages
- Button has three states: default (black), disabled/thinking (grey), active (green via `.location-active`)

**JavaScript changes:**
- `js/constants.js` — replaced `MESSAGES` with `DEFAULT_MESSAGES`: three weather-teaser screens shown before location is granted
- `js/MessageRotator.js` — updated import, added `setMessages(newMessages)` method so the rotator can switch from teasers to live weather without a page reload
- `js/WeatherService.js` — new file (see Architecture section)
- `js/main.js` — full rewrite (see Architecture section)

**Other:**
- `README.md` rewritten for flipweather
- `.claude/launch.json` created for Claude Code dev server auto-start

### Session 2 — Bug fixes, fallback, and portrait mode

**Weather API fallback:**
Open-Meteo (primary source) was returning a 502 Bad Gateway during testing. Added `wttr.in` as a silent fallback. The app now tries Open-Meteo first with a 6-second timeout, and if that fails, automatically retries with wttr.in. Users never see an error unless both fail simultaneously. Also added `AbortController`-based timeouts to all fetches so the app never hangs for 10+ seconds on a dead API.

**Button state fixes (caught during manual testing):**
- Added `locationBtn.textContent = 'Detecting location...'` on click
- Reset to `'Try Again'` on error
- Clear error status text on success
- These were actually found and fixed by the developer during manual testing — a good example of reading the code and understanding the pattern well enough to self-debug

**Portrait mode for mobile:**
The original board is a 22-column × 5-row horizontal grid — great on desktops, unreadable on phones. Added a 9-column × 12-row portrait grid that activates automatically on phones (≤600px, portrait orientation). See Architecture section for details.

---

## Architecture

### No bundler, no npm, pure ES modules

There is no build step. No Webpack, no Vite, no `package.json`. The JavaScript uses native ES module `import`/`export` statements and runs directly in the browser.

**Why this matters:** ES modules don't work over `file://` URLs (browser security restriction). The app must be served over HTTP, even locally. The one-liner is `python3 -m http.server 9090`. Once deployed anywhere (GitHub Pages, Netlify, etc.), it works normally.

**Why no bundler?** The app has no npm dependencies. Adding a bundler would introduce a build step, a `node_modules` folder, and tooling complexity for zero benefit. This is the minority case where vanilla ES modules are the right call.

### WeatherService.js — two sources, one interface

```
fetchWeather(lat, lon)
  → tries fetchOpenMeteo() with 6s timeout
  → on failure, warns to console and tries fetchWttr() with 8s timeout
  → both resolve to the same normalized shape:
    { condition, temp, feelsLike, windSpeed, windDir, humidity, uvIndex }

fetchLocationName(lat, lon)
  → Nominatim/OpenStreetMap reverse geocoding, 6s timeout
  → returns city name as uppercase string

formatMessages(weather, locationName)
  → returns 4 five-line arrays for the landscape (22×5) board

formatMessagesPortrait(weather, locationName)
  → returns 4 twelve-line arrays for the portrait (9×12) board
  → uses wrapLine() helper to break long strings at word boundaries
```

**Data sources:**
- [Open-Meteo](https://open-meteo.com) — primary, returns WMO weather codes + numeric values
- [wttr.in](https://wttr.in) — fallback, returns pre-formatted compass directions and text descriptions
- [Nominatim/OSM](https://nominatim.openstreetmap.org) — reverse geocoding for city names

All three are free with no API key required.

### Board.js — configurable grid

The original Board.js hardcoded `GRID_COLS = 22` and `GRID_ROWS = 5`. It was changed to accept optional constructor parameters:

```js
new Board(containerEl, soundEngine)              // landscape: 22×5
new Board(containerEl, soundEngine, 9, 12)       // portrait: 9×12
```

The CSS custom properties `--grid-cols` and `--grid-rows` are set on the board element, so the CSS grid adapts automatically. Tile size for portrait is set via inline style (`clamp(28px, 8.5vw, 36px)`) to override the responsive breakpoint rules.

### main.js — orientation detection and board lifecycle

```js
const PORTRAIT_QUERY = window.matchMedia('(max-width: 600px) and (orientation: portrait)');
```

On `DOMContentLoaded`, `buildBoard()` checks this query and creates the appropriate board. If the user rotates their phone, a `change` listener fires, tears down the old board, builds a new one, and reformats whatever messages are currently loaded (default teasers or live weather) for the new grid.

Current weather data is stored in `currentWeather` and `currentLocationName` module-level variables so it can be reformatted on orientation change without re-fetching.

The geolocation flow:
1. User clicks "Enable Location" → button disables, text → "Detecting location..."
2. `navigator.geolocation.getCurrentPosition()` fires
3. On success → stop rotator, show orientation-appropriate loading message on board
4. `Promise.all`: fetch weather + fetch location name + wait `TOTAL_TRANSITION + 500ms` (so board animation completes before new content loads)
5. On resolve → `rotator.setMessages(weatherMessages())` → button → "Weather Active" (green)
6. On geolocation error → specific message for denied/timeout/other, button → "Try Again"
7. On API error → "Weather services unavailable. Please try again later.", button → "Try Again"

---

## Known Quirks

**ES module caching in the Claude Code preview tool:** When editing files and using `preview_eval` to test, the browser's module cache can serve stale JS. Workaround used during development: import with a cache-busting query string (`/js/Board.js?v=${Date.now()}`). This is a dev-tool quirk only — real users loading the page fresh don't encounter it.

**`(orientation: portrait)` vs `screen.orientation.type`:** These are different things. The CSS media query is based on viewport width vs. height. `screen.orientation.type` reflects the hardware orientation reported by the OS. They can disagree (e.g., a landscape-sized browser window on a portrait-held phone). The CSS media query is the right one to use for layout decisions.

**Open-Meteo occasional outages:** Open-Meteo is free and generally reliable but had a 502 outage during development. The wttr.in fallback handles this silently. If both are down, the error message says "Weather services unavailable" rather than blaming the user's connection.

**iOS Safari fullscreen:** `requestFullscreen()` is not supported on iOS Safari. The `F` keyboard shortcut does nothing on iPhones. Not worth working around for this use case.

---

## Deployment

Deployed to GitHub Pages via repo Settings → Pages → Branch: main → Folder: / (root).

GitHub Pages serves over HTTPS automatically, which is required for:
- `navigator.geolocation` (browsers block geolocation on non-HTTPS except localhost)
- General security expectations

No build step needed. GitHub Pages serves the static files directly.

---

## File Structure

```
flipweather/
  index.html                — Single-page app shell
  css/
    reset.css               — Unchanged from flipoff
    layout.css              — Page layout + location button states
    board.css               — Board container, accent bars (unchanged from flipoff)
    tile.css                — 3D flip animation (unchanged from flipoff)
    responsive.css          — Media queries, portrait overrides
  js/
    main.js                 — Entry point, geolocation flow, orientation handling
    WeatherService.js       — API fetching, fallback logic, message formatting
    MessageRotator.js       — Auto-rotation timer + setMessages()
    Board.js                — Grid manager, configurable dimensions
    Tile.js                 — Individual tile flip animation (unchanged)
    SoundEngine.js          — Web Audio API wrapper (unchanged)
    KeyboardController.js   — Keyboard shortcuts (unchanged)
    constants.js            — Grid sizes, timing, colors, default messages
    flapAudio.js            — Embedded base64 audio (unchanged)
  notes/
    DEVELOPMENT.md          — This file
    session-01-learnings.md — Developer learning journal, session 1
    obsidian-atomic-notes.md — How to use Obsidian for technical learning
    obsidian-for-designers.md — Obsidian setup guide for semi-technical users
  .claude/
    launch.json             — Dev server config for Claude Code
  README.md                 — Public-facing docs
```

---

## If You're a Future Agent Reading This

- The landscape board (22×5) and portrait board (9×12) are separate Board instances, not CSS transforms
- Message arrays must match the board's row count — landscape messages have 5 elements, portrait have 12
- `rotator.setMessages()` stops the current timer, resets the index, and restarts — use this instead of stop/start manually
- All fetch calls have timeouts via `AbortController` — don't remove them
- The `--tile-size` CSS variable is set via inline style on portrait boards to beat the responsive breakpoint cascade
- Don't add a bundler or build step — there's no reason for one and it would break the "just open it" simplicity
