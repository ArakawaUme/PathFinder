let itineraries = []; // Array to hold itineraries

async function fetchCountryData(countryName = null) {
    // If countryName is not provided, get it from the input
    if (!countryName) {
        countryName = document.getElementById('countryInput').value.trim();
    } else {
        // Update the input field with the clicked country name
        document.getElementById('countryInput').value = countryName;
    }

    const resultDiv = document.getElementById('result');
    const weatherDiv = document.getElementById('weather');
  
    // Clear previous results
    resultDiv.innerHTML = '';
    weatherDiv.style.display = 'none';
  
    if (!countryName) {
      resultDiv.innerHTML = `<p>Please enter a country name.</p>`;
      return;
    }
  
    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
      if (!response.ok) throw new Error("Country not found");
  
      const countries = await response.json();
      if (countries.length === 0) {
        throw new Error("Country not found");
      }
  
      const data = countries[0];
      
      // Fetch nearby countries using borders data
      let nearbyCountries = [];
      if (data.borders && data.borders.length > 0) {
        const borderCodes = data.borders.join(',');
        const nearbyResponse = await fetch(`https://restcountries.com/v3.1/alpha?codes=${borderCodes}`);
        if (nearbyResponse.ok) {
          nearbyCountries = await nearbyResponse.json();
        }
      }

      const area = data.area ? `${data.area.toLocaleString()} sq. km` : 'N/A';
      const continent = data.continents ? data.continents[0] : 'N/A';
      const region = data.region || 'N/A';
      const subregion = data.subregion || 'N/A';
      const capital = data.capital ? data.capital[0] : 'N/A';
      const languages = data.languages ? Object.values(data.languages).join(', ') : 'N/A';
      const timezones = data.timezones ? data.timezones.join(', ') : 'N/A';
      const population = data.population ? data.population.toLocaleString() : 'N/A';
      const flagUrl = data.flags ? data.flags.png : '';
      const coatOfArmsUrl = data.coatOfArms ? data.coatOfArms.png : '';
      const mapUrl = data.maps ? data.maps.googleMaps : 'N/A';
      const location = data.latlng ? `Latitude: ${data.latlng[0]}, Longitude: ${data.latlng[1]}` : 'N/A';
  
      resultDiv.innerHTML = 
        `<div class="country-card">
          <div class="country-header">
            <img src="${flagUrl}" alt="${data.name.common} Flag">
            <h2>${data.name.common}</h2>
          </div>
          <div class="country-section">
            <h3>Geographical Information</h3>
            <p><strong>Continent:</strong> ${continent}</p>
            <p><strong>Region:</strong> ${region}</p>
            <p><strong>Subregion:</strong> ${subregion}</p>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Area:</strong> ${area}</p>
            <p><strong>Population:</strong> ${population}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Map:</strong> <a href="${mapUrl}" target="_blank">View on Google Maps</a></p>
          </div>
          <div class="country-section">
            <h3>Languages & Timezones</h3>
            <p><strong>Languages:</strong> ${languages}</p>
            <p><strong>Time Zones:</strong> ${timezones}</p>
          </div>
          ${coatOfArmsUrl ? 
            `<div class="country-section">
              <h3>Symbols</h3>
              <p><strong>Coat of Arms:</strong><br><img src="${coatOfArmsUrl}" alt="${data.name.common} Coat of Arms" width="50"></p>
            </div>` : ''}
          ${nearbyCountries.length > 0 ? 
            `<div class="country-section">
              <h3>Bordering Countries</h3>
              <div class="nearby-countries">
                ${nearbyCountries.map(country => `
                  <div class="nearby-country" onclick="fetchCountryData('${country.name.common}')">
                    <img src="${country.flags.png}" alt="${country.name.common} Flag">
                    <p>${country.name.common}</p>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
        </div>`;

      // Fetch and display weather data
      try {
        const weatherResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=32804b24a847407391c53709241010&q=${countryName}`);
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          displayWeatherData(weatherData);
        }
      } catch (weatherError) {
        console.error("Error fetching weather data:", weatherError);
      }

    } catch (error) {
      console.error("Error fetching country data:", error);
      resultDiv.innerHTML = `<p>Could not retrieve data for "${countryName}". Please check the spelling or try a different country.</p>`;
    }
}

function displayWeatherData(data) {
    const weatherDiv = document.getElementById('weather');
    const weatherDataDiv = document.getElementById('weatherData');
    
    const current = data.current;
    const forecast = data.forecast.forecastday[0].day;
    
    weatherDataDiv.innerHTML = `
        <div class="weather-item">
            <p><strong>Condition:</strong> ${current.condition.text}</p>
        </div>
        <div class="weather-item">
            <p><strong>Temperature:</strong> ${current.temp_c}°C / ${current.temp_f}°F</p>
        </div>
        <div class="weather-item">
            <p><strong>Humidity:</strong> ${current.humidity}%</p>
        </div>
        <div class="weather-item">
            <p><strong>Wind:</strong> ${current.wind_kph} km/h</p>
        </div>
        <div class="weather-item">
            <p><strong>Chance of Rain:</strong> ${forecast.daily_chance_of_rain}%</p>
        </div>
        <div class="weather-item">
            <p><strong>Chance of Snow:</strong> ${forecast.daily_chance_of_snow}%</p>
        </div>
    `;
    
    weatherDiv.style.display = 'block';
}

function saveItinerary() {
    const countryName = document.getElementById('countryInput').value.trim();
    if (!countryName) {
      alert("Please enter a country name to save.");
      return;
    }

    itineraries.push(countryName); // Save the itinerary
    displayItineraries(); // Update the display
}

function displayItineraries() {
    const itinerariesList = document.getElementById('itinerariesList');
    itinerariesList.innerHTML = itineraries.map(itinerary => 
      `<div class="itinerary">${itinerary}</div>`).join('');
}
