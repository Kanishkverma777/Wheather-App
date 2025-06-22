// Replace with YOUR actual API key
const API_KEY = '0f38082371df47c99e5184044252206';

const unitToggle = document.getElementById('unitToggle');
const unitLabel = document.getElementById('unitLabel');
let isCelsius = true;

document.getElementById('weatherForm').addEventListener('submit', function(e) {
  e.preventDefault();
  getWeather();
});

unitToggle.addEventListener('change', function() {
  isCelsius = !isCelsius;
  unitLabel.textContent = isCelsius ? '°C' : '°F';
  getWeather();
});

function getWeatherIcon(condition) {
  // Normalize condition text
  const text = condition.trim().toLowerCase();

  // Partial and exact matches for broader coverage
  if (text.includes('sunny')) return 'wi-day-sunny';
  if (text.includes('clear')) return 'wi-night-clear';
  if (text.includes('partly cloudy')) return 'wi-day-cloudy';
  if (text.includes('cloudy')) return 'wi-cloudy';
  if (text.includes('overcast')) return 'wi-cloudy';
  if (text.includes('mist') || text.includes('fog')) return 'wi-fog';
  if (text.includes('rain') && text.includes('thunder')) return 'wi-thunderstorm';
  if (text.includes('thunder')) return 'wi-thunderstorm';
  if (text.includes('drizzle')) return 'wi-sprinkle';
  if (text.includes('rain')) return 'wi-rain';
  if (text.includes('snow')) return 'wi-snow';
  if (text.includes('sleet')) return 'wi-sleet';
  if (text.includes('hail') || text.includes('pellet')) return 'wi-hail';
  if (text.includes('shower')) return 'wi-showers';
  if (text.includes('wind')) return 'wi-strong-wind';
  // Add more as needed

  // Default icon
  return 'wi-na';
}

function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  const resultDiv = document.getElementById('result');
  const forecastDiv = document.getElementById('forecast');
  if (!city) {
    resultDiv.innerHTML = `<p style="color:#ff7e5f;">Please enter a city name.</p>`;
    forecastDiv.innerHTML = '';
    return;
  }

  resultDiv.innerHTML = `<p>Loading...</p>`;
  forecastDiv.innerHTML = '';

  // Fetch current weather
  fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`)
    .then(response => {
      if (!response.ok) throw new Error(`City not found (${response.status})`);
      return response.json();
    })
    .then(data => {
      const condition = data.current.condition.text;
      const iconClass = getWeatherIcon(condition);

      resultDiv.innerHTML = `
        <i class="wi ${iconClass}" aria-hidden="true"></i>
        <h2>${data.location.name}, ${data.location.country}</h2>
        <p><strong>${isCelsius ? data.current.temp_c + "°C" : data.current.temp_f + "°F"}</strong></p>
        <p>${condition}</p>
      `;

      // Fetch forecast (3 days for demo)
      return fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no`);
    })
    .then(response => {
      if (!response.ok) throw new Error('Forecast not available');
      return response.json();
    })
    .then(data => {
      const days = data.forecast.forecastday;
      const forecastCards = days.map(day => {
        const cond = day.day.condition.text;
        const iconClass = getWeatherIcon(cond);
        // Get day name
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
        return `
          <div class="forecast-card" tabindex="0" aria-label="${dayName} forecast">
            <div class="day">${dayName}</div>
            <i class="wi ${iconClass}" aria-hidden="true"></i>
            <div class="temp">${isCelsius ? day.day.avgtemp_c + "°C" : day.day.avgtemp_f + "°F"}</div>
          </div>
        `;
      }).join('');
      forecastDiv.innerHTML = forecastCards;
    })
    .catch(error => {
      resultDiv.innerHTML = `<p style="color:#ff7e5f;">Error: ${error.message}</p>`;
      forecastDiv.innerHTML = '';
    });
}