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

export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m,` +
    `relativehumidity_2m,uv_index&temperature_unit=fahrenheit&windspeed_unit=mph`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

export async function fetchLocationName(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Geocoding fetch failed');
  const data = await res.json();
  const addr = data.address || {};
  return (addr.city || addr.town || addr.village || addr.county || 'UNKNOWN').toUpperCase();
}

export function formatMessages(weatherData, locationName) {
  const c = weatherData.current;
  const condition = WMO_CONDITIONS[c.weathercode] ?? 'CONDITIONS UNKNOWN';
  const temp = Math.round(c.temperature_2m);
  const feelsLike = Math.round(c.apparent_temperature);
  const windSpeed = Math.round(c.windspeed_10m);
  const windDir = degreesToCompass(c.winddirection_10m);
  const humidity = Math.round(c.relativehumidity_2m);
  const uvIndex = Math.round(c.uv_index ?? 0);

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
