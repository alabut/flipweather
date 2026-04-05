# FlipWeather.

**Live local weather on a retro split-flap display.** Real-time conditions, delivered with old-school style.

Forked from [magnum6actual/flipoff](https://github.com/magnum6actual/flipoff) — the original split-flap display web app.

## What is this?

FlipWeather wires up real live weather data to a classic mechanical split-flap (flip-board) display — the kind you'd see at train stations and airports. Click "Enable Location", and your local weather rotates across the board in four screens:

1. **City + Condition** — where you are and what the sky looks like
2. **Temperature** — current temp and feels-like in °F
3. **Wind** — speed in MPH and compass direction
4. **Humidity + UV** — relative humidity and UV index

No API keys. No accounts. Powered by [Open-Meteo](https://open-meteo.com) (weather) and [Nominatim/OSM](https://nominatim.openstreetmap.org) (reverse geocoding) — both free and open.

## Quick Start

> **Must be served over HTTP** — ES modules don't work with `file://` URLs.

```bash
git clone https://github.com/magnum6actual/flipoff  # or your fork
cd flipweather
python3 -m http.server 9090
# Open http://localhost:9090
```

If you're using Claude Code, the dev server is pre-configured — just run the `FlipWeather Dev Server` launch task.

## How to Use

1. Open `http://localhost:9090` in a browser
2. Click **Enable Location** to grant geolocation access
3. The board fetches your weather and starts rotating through the 4 screens
4. Press `F` for fullscreen TV mode
5. Click anywhere to enable the flip sound

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Next screen |
| `Arrow Left` | Previous screen |
| `Arrow Right` | Next screen |
| `F` | Toggle fullscreen |
| `M` | Toggle mute |
| `Escape` | Exit fullscreen |

## File Structure

```
flipweather/
  index.html              — Single-page app
  css/
    reset.css             — CSS reset
    layout.css            — Page layout (header, hero, board)
    board.css             — Board container and accent bars
    tile.css              — Tile styling and 3D flip animation
    responsive.css        — Media queries for all screen sizes
  js/
    main.js               — Entry point and UI wiring
    WeatherService.js     — Open-Meteo + Nominatim API calls
    Board.js              — Grid manager and transition orchestration
    Tile.js               — Individual tile animation logic
    SoundEngine.js        — Audio playback with Web Audio API
    MessageRotator.js     — Screen rotation timer
    KeyboardController.js — Keyboard shortcut handling
    constants.js          — Configuration (grid size, colors, default messages)
    flapAudio.js          — Embedded audio data (base64)
  .claude/
    launch.json           — Dev server config for Claude Code users
```

## Credits

- Weather data: [Open-Meteo](https://open-meteo.com) — free, no API key required
- Reverse geocoding: [Nominatim](https://nominatim.openstreetmap.org) by OpenStreetMap contributors
- Split-flap display engine: forked from [magnum6actual/flipoff](https://github.com/magnum6actual/flipoff)

## License

MIT — do whatever you want with it.
