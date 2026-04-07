import { Board } from './Board.js';
import { SoundEngine } from './SoundEngine.js';
import { MessageRotator } from './MessageRotator.js';
import { KeyboardController } from './KeyboardController.js';
import { fetchWeather, fetchLocationName, formatMessages } from './WeatherService.js';
import { TOTAL_TRANSITION } from './constants.js';

document.addEventListener('DOMContentLoaded', () => {
  const boardContainer = document.getElementById('board-container');
  const soundEngine = new SoundEngine();
  const board = new Board(boardContainer, soundEngine);
  const rotator = new MessageRotator(board);
  const keyboard = new KeyboardController(rotator, soundEngine);

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

  // Start default message rotation (weather teasers)
  rotator.start();

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
          board.displayMessage(['', 'FETCHING', 'WEATHER DATA', 'PLEASE WAIT', '']);

          try {
            // Wait for both fetches AND the board animation to finish
            const [weatherData, locationName] = await Promise.all([
              fetchWeather(latitude, longitude),
              fetchLocationName(latitude, longitude),
              new Promise(resolve => setTimeout(resolve, TOTAL_TRANSITION + 500))
            ]);

            const weatherMessages = formatMessages(weatherData, locationName);
            rotator.setMessages(weatherMessages);

            locationBtn.textContent = 'Weather Active';
            locationStatus.textContent = '';
            locationBtn.classList.add('location-active');
          } catch (err) {
            locationStatus.textContent = 'Weather services unavailable. Please try again later.';
            locationBtn.disabled = false;
            locationBtn.textContent = 'Try Again';
            rotator.setMessages(rotator.messages); // restart with current messages
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
