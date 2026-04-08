import { Board } from './Board.js';
import { SoundEngine } from './SoundEngine.js';
import { MessageRotator } from './MessageRotator.js';
import { KeyboardController } from './KeyboardController.js';
import { fetchWeather, fetchLocationName, formatMessages, formatMessagesPortrait } from './WeatherService.js';
import {
  TOTAL_TRANSITION,
  GRID_COLS_PORTRAIT, GRID_ROWS_PORTRAIT,
  DEFAULT_MESSAGES, DEFAULT_MESSAGES_PORTRAIT
} from './constants.js';

// Matches phones in portrait — tablets and landscape are handled by the landscape board
const PORTRAIT_QUERY = window.matchMedia('(max-width: 600px) and (orientation: portrait)');

// Persists across orientation changes so we can reformat for the new grid
let currentWeather = null;
let currentLocationName = null;

document.addEventListener('DOMContentLoaded', () => {
  const boardContainer = document.getElementById('board-container');
  const soundEngine = new SoundEngine();

  // Initialize audio on first user interaction (browser autoplay policy)
  let audioInitialized = false;
  const initAudio = async () => {
    if (audioInitialized) return;
    audioInitialized = true;
    await soundEngine.init();
    soundEngine.resume();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);

  // Build the board sized for current orientation
  function buildBoard() {
    boardContainer.innerHTML = '';
    const portrait = PORTRAIT_QUERY.matches;
    const board = portrait
      ? new Board(boardContainer, soundEngine, GRID_COLS_PORTRAIT, GRID_ROWS_PORTRAIT)
      : new Board(boardContainer, soundEngine);

    // Set tile size via inline style so it always beats responsive.css
    if (portrait) {
      board.boardEl.style.setProperty('--tile-size', 'clamp(28px, 8.5vw, 36px)');
      board.boardEl.style.setProperty('--tile-gap', '3px');
    }
    return board;
  }

  function defaultMessages() {
    return PORTRAIT_QUERY.matches ? DEFAULT_MESSAGES_PORTRAIT : DEFAULT_MESSAGES;
  }

  function weatherMessages() {
    if (!currentWeather) return null;
    return PORTRAIT_QUERY.matches
      ? formatMessagesPortrait(currentWeather, currentLocationName)
      : formatMessages(currentWeather, currentLocationName);
  }

  // Status bar — tracks health of each API service + last updated time
  let statusTickRef = null;

  function formatTimestamp(timestamp) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(timestamp));
  }

  function setServiceState(id, state) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('up', 'down');
    if (state) el.classList.add(state);
  }

  // Ping all three services on load — no location needed, uses a fixed coordinate
  async function pingServices() {
    const lat = 40.71, lon = -74.01; // NYC — just checking reachability
    const checks = [
      {
        id: 'status-openmeteo',
        url: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`,
        timeout: 6000
      },
      {
        id: 'status-wttr',
        url: `https://wttr.in/~${lat},${lon}?format=j1`,
        timeout: 8000
      },
      {
        id: 'status-nominatim',
        url: `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        timeout: 6000
      }
    ];

    checks.forEach(async ({ id, url, timeout }) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        setServiceState(id, res.ok ? 'up' : 'down');
      } catch {
        setServiceState(id, 'down');
      }
    });
  }

  // After real weather loads: update open-meteo dot based on actual result,
  // leave wttr.in and nominatim as the health check left them
  function updateStatus(source, timestamp) {
    setServiceState('status-openmeteo', source === 'open-meteo' ? 'up' : 'down');

    const updatedEl = document.getElementById('status-updated');
    if (!updatedEl) return;
    updatedEl.textContent = `Updated ${formatTimestamp(timestamp)}`;
  }

  function loadingMessage() {
    return PORTRAIT_QUERY.matches
      ? ['', '', '', 'FETCHING', 'WEATHER', 'DATA', '', 'PLEASE', 'WAIT', '', '', '']
      : ['', 'FETCHING', 'WEATHER DATA', 'PLEASE WAIT', ''];
  }

  // Initial board + rotator — use orientation-appropriate default messages from the start
  let board = buildBoard();
  const rotator = new MessageRotator(board);
  const keyboard = new KeyboardController(rotator, soundEngine);
  rotator.setMessages(defaultMessages());

  // Health check all three services immediately — no location needed
  pingServices();

  // Rebuild board when phone is rotated
  PORTRAIT_QUERY.addEventListener('change', () => {
    rotator.stop();
    board = buildBoard();
    rotator.board = board;
    rotator.setMessages(weatherMessages() || defaultMessages());
  });

  // Volume toggle button in header
  const volumeBtn = document.getElementById('volume-btn');
  if (volumeBtn) {
    volumeBtn.addEventListener('click', () => {
      initAudio();
      const muted = soundEngine.toggleMute();
      volumeBtn.classList.toggle('muted', muted);
    });
  }

  // "Enable Location" button: request geolocation on explicit click only
  const locationBtn = document.getElementById('location-btn');
  const locationStatus = document.getElementById('location-status');

  if (locationBtn) {
    locationBtn.addEventListener('click', async () => {
      initAudio();
      locationBtn.disabled = true;
      locationBtn.textContent = 'Detecting location...';

      if (!navigator.geolocation) {
        locationStatus.textContent = 'Geolocation is not supported by your browser.';
        locationBtn.disabled = false;
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Show a loading state on the board immediately
          rotator.stop();
          board.displayMessage(loadingMessage());

          try {
            // Wait for both fetches AND the board animation to finish
            const [weatherData, locationName] = await Promise.all([
              fetchWeather(latitude, longitude),
              fetchLocationName(latitude, longitude),
              new Promise(resolve => setTimeout(resolve, TOTAL_TRANSITION + 500))
            ]);

            // Store for re-use when orientation changes
            currentWeather = weatherData;
            currentLocationName = locationName;
            updateStatus(weatherData.source, Date.now());

            rotator.setMessages(weatherMessages());

            locationBtn.textContent = 'Weather Active';
            locationStatus.textContent = '';
            locationBtn.classList.add('location-active');
          } catch (err) {
            locationStatus.textContent = 'Weather services unavailable. Please try again later.';
            locationBtn.disabled = false;
            locationBtn.textContent = 'Try Again';
            rotator.setMessages(defaultMessages());
          }
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            locationStatus.textContent = 'Location access denied. Enable it in your browser settings.';
          } else if (err.code === err.TIMEOUT) {
            locationStatus.textContent = 'Location request timed out. Please try again.';
          } else {
            locationStatus.textContent = 'Could not get your location. Please try again.';
          }
          locationBtn.textContent = 'Try Again';
          locationBtn.disabled = false;
        },
        { timeout: 10000 }
      );
    });
  }
});
