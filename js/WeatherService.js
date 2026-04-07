const WMO_CONDITIONS = {
  0:  'CLEAR SKY',
  1:  'MOSTLY CLEAR',
  2:  'PARTLY CLOUDY',
  3:  'OVERCAST',
  45: 'FOGGY',
  48: 'FOGGY',
  51: 'LIGHT DRIZZLE',
  53: 'DRIZZLE',
  55: 'HEAVY DRIZZLE',
  61: 'LIGHT RAIN',
  63: 'RAIN',
  65: 'HEAVY RAIN',
  71: 'LIGHT SNOW',
  73: 'SNOW',
  75: 'HEAVY SNOW',
  77: 'SNOW GRAINS',
  80: 'LIGHT SHOWERS',
  81: 'SHOWERS',
  82: 'HEAVY SHOWERS',
  85: 'SNOW SHOWERS',
  86: 'HEAVY SNOW SHOWERS',
  95: 'THUNDERSTORM',
  96: 'SEVERE STORM',
  99: 'SEVERE STORM'
};

const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function degreesToCompass(degrees) {
  const index = Math.round(degrees / 45) % 8;
  return WIND_DIRECTIONS[index];
}

// Fetch with a hard timeout so we don't hang for 10+ seconds on a bad API
async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// Normalized shape both sources resolve to:
// { condition, temp, feelsLike, windSpeed, windDir, humidity, uvIndex }

async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m,` +
    `relativehumidity_2m,uv_index&temperature_unit=fahrenheit&windspeed_unit=mph`;
  const res = await fetchWithTimeout(url, {}, 6000);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = await res.json();
  const c = data.current;
  return {
    condition: WMO_CONDITIONS[c.weathercode] ?? 'CONDITIONS UNKNOWN',
    temp:      Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    windSpeed: Math.round(c.windspeed_10m),
    windDir:   degreesToCompass(c.winddirection_10m),
    humidity:  Math.round(c.relativehumidity_2m),
    uvIndex:   Math.round(c.uv_index ?? 0)
  };
}

async function fetchWttr(lat, lon) {
  const url = `https://wttr.in/~${lat},${lon}?format=j1`;
  const res = await fetchWithTimeout(url, {}, 8000);
  if (!res.ok) throw new Error(`wttr.in ${res.status}`);
  const data = await res.json();
  const c = data.current_condition[0];
  return {
    condition: c.weatherDesc[0].value.toUpperCase(),
    temp:      parseInt(c.temp_F, 10),
    feelsLike: parseInt(c.FeelsLikeF, 10),
    windSpeed: parseInt(c.windspeedMiles, 10),
    windDir:   c.winddir16Point,
    humidity:  parseInt(c.humidity, 10),
    uvIndex:   parseInt(c.uvIndex, 10)
  };
}

// Tries Open-Meteo first, silently falls back to wttr.in
export async function fetchWeather(lat, lon) {
  try {
    return await fetchOpenMeteo(lat, lon);
  } catch (e) {
    console.warn('Open-Meteo unavailable, falling back to wttr.in:', e.message);
    return await fetchWttr(lat, lon);
  }
}

export async function fetchLocationName(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetchWithTimeout(
    url,
    { headers: { 'Accept-Language': 'en' } },
    6000
  );
  if (!res.ok) throw new Error('Geocoding fetch failed');
  const data = await res.json();
  const addr = data.address || {};
  return (addr.city || addr.town || addr.village || addr.county || 'UNKNOWN').toUpperCase();
}

export function formatMessages(weather, locationName) {
  const { condition, temp, feelsLike, windSpeed, windDir, humidity, uvIndex } = weather;

  // Truncate city name to fit 22-col board
  const city = locationName.slice(0, 18);

  return [
    // Screen 1: Location + condition
    ['', city, condition, '', ''],

    // Screen 2: Temperature
    ['', 'TEMPERATURE', `${temp}°F`, `FEELS LIKE ${feelsLike}°F`, ''],

    // Screen 3: Wind
    ['', 'WIND SPEED', `${windSpeed} MPH`, `FROM ${windDir}`, ''],

    // Screen 4: Humidity + UV
    ['', `HUMIDITY ${humidity}%`, `UV INDEX ${uvIndex}`, '', '']
  ];
}
