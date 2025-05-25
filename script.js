const apiConfig = {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    geoUrl: 'https://api.openweathermap.org/geo/1.0',
    apiKey: '31f78df5e0195e29d892828fea31b502',
    units: 'metric',
    lang: 'en'
};

const weatherBackgrounds = {
    '01d': 'clear-day',
    '01n': 'clear-night',
    '02d': 'clouds',
    '02n': 'clouds',
    '03d': 'clouds',
    '03n': 'clouds',
    '04d': 'clouds',
    '04n': 'clouds',
    '09d': 'rain',
    '09n': 'rain',
    '10d': 'rain',
    '10n': 'rain',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snow',
    '13n': 'snow',
    '50d': 'mist',
    '50n': 'mist'
};

let chartInstance = null;
let rainAnimationActive = false;

const elements = {
    locationInput: document.getElementById('location-input'),
    searchButton: document.getElementById('search-button'),
    locationName: document.getElementById('location-name'),
    temperatureValue: document.getElementById('temperature-value'),
    conditionValue: document.getElementById('condition-value'),
    humidityValue: document.getElementById('humidity-value'),
    windSpeedValue: document.getElementById('wind-speed-value'),
    feelsLikeValue: document.getElementById('feels-like-value'),
    pressureValue: document.getElementById('pressure-value'),
    forecastGrid: document.getElementById('forecast-grid'),
    historicalDataChart: document.getElementById('historical-data-chart'),
    previousSearches: document.getElementById('previous-searches'),
    locationSelector: document.getElementById('location-selector'),
    locationOptions: document.getElementById('location-options'),
    closeSelector: document.getElementById('close-selector'),
    errorMessage: document.getElementById('error-message'),
    loadingIndicator: document.getElementById('loading-indicator'),
    weatherBackground: document.getElementById('weather-background')
};

function initApp() {
    elements.searchButton.addEventListener('click', handleSearch);
    elements.locationInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleSearch();
    });
    
    if (elements.closeSelector) {
        elements.closeSelector.addEventListener('click', () => {
            elements.locationSelector.style.display = 'none';
        });
    }
    
    showPreviousSearches();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const coords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                fetchWeatherByCoords(coords);
            },
            error => {
                fetchWeatherByCity('London');
            }
        );
    } else {
        fetchWeatherByCity('London');
    }
}

async function handleSearch() {
    const location = elements.locationInput.value.trim();
    
    const validation = validateLocationInput(location);
    if (!validation.isValid) {
        showError(validation.errorMessage);
        return;
    }
    
    clearWeatherDisplay();
    
    try {
        const locations = await geocodeLocation(location);
        
        if (locations.length > 1) {
            showLocationSelector(locations);
        } else if (locations.length === 1) {
            const coords = {
                lat: locations[0].lat,
                lon: locations[0].lon
            };
            
            savePreviousSearch(locations[0].name, coords.lat, coords.lon);
            
            await fetchWeatherByCoords(coords);
        } else {
            showError('No locations found. Please try a different search term.');
            resetWeatherBackground();
        }
    } catch (error) {
        showError(error.message || 'Failed to fetch location data');
        resetWeatherBackground();
    }
}

async function fetchWeatherByCoords(coords) {
    showLoading(true);
    
    try {
        const weatherData = await fetchApiData('weather', {
            lat: coords.lat,
            lon: coords.lon
        });
        
        const forecastData = await fetchApiData('forecast', {
            lat: coords.lat,
            lon: coords.lon
        });
        
        const historicalData = createMockHistoricalData(forecastData);
        
        displayCurrentWeather(weatherData);
        displayForecast(forecastData);
        displayHistoricalData(historicalData);
        
        setWeatherBackground(weatherData.weather[0].icon);
        
        showPreviousSearches();
        
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
        resetWeatherBackground();
    } finally {
        showLoading(false);
    }
}

function setWeatherBackground(iconCode) {
    if (!elements.weatherBackground) return;
    
    stopRainAnimation();
    
    let backgroundClass = weatherBackgrounds[iconCode];
    
    if (!backgroundClass) {
        backgroundClass = 'clear-day';
    }
    
    elements.weatherBackground.className = 'weather-background';
    elements.weatherBackground.classList.add(backgroundClass);
    
    void elements.weatherBackground.offsetWidth;
    
    if (backgroundClass === 'rain' || backgroundClass === 'thunderstorm') {
        startRainAnimation();
    }
}

function resetWeatherBackground() {
    if (!elements.weatherBackground) return;
    
    stopRainAnimation();
    
    elements.weatherBackground.className = 'weather-background';
    elements.weatherBackground.classList.add('clear-day');
}

function startRainAnimation() {
    if (rainAnimationActive) return;
    
    rainAnimationActive = true;
    const rainContainer = elements.weatherBackground;
    
    const raindropsCount = Math.floor(window.innerWidth / 5);
    
    for (let i = 0; i < raindropsCount; i++) {
        createRaindrop(rainContainer);
    }
    
    const rainInterval = setInterval(() => {
        if (!rainAnimationActive) {
            clearInterval(rainInterval);
            return;
        }
        
        for (let i = 0; i < 5; i++) {
            createRaindrop(rainContainer);
        }
    }, 200);
}

function createRaindrop(container) {
    const raindrop = document.createElement('div');
    raindrop.className = 'raindrop';
    
    const size = Math.random() * 1.5 + 0.5;
    const posX = Math.random() * 100;
    const duration = Math.random() * 0.5 + 0.5;
    const delay = Math.random() * 2;
    
    raindrop.style.left = `${posX}%`;
    raindrop.style.width = `${size}px`;
    raindrop.style.height = `${size * 10}px`;
    raindrop.style.animationDuration = `${duration}s`;
    raindrop.style.animationDelay = `${delay}s`;
    raindrop.style.opacity = Math.random() * 0.5 + 0.5;
    
    container.appendChild(raindrop);
    
    setTimeout(() => {
        if (container.contains(raindrop)) {
            container.removeChild(raindrop);
        }
    }, (duration + delay) * 1000);
}

function stopRainAnimation() {
    rainAnimationActive = false;
    
    const raindrops = document.querySelectorAll('.raindrop');
    raindrops.forEach(drop => drop.remove());
}

async function fetchWeatherByCity(city) {
    try {
        const locations = await geocodeLocation(city);
        if (locations.length > 0) {
            fetchWeatherByCoords({
                lat: locations[0].lat,
                lon: locations[0].lon
            });
        } else {
            showError('City not found');
        }
    } catch (error) {
        showError(error.message || 'Failed to fetch location data');
    }
}

async function fetchApiData(endpoint, params) {
    try {
        const url = buildApiUrl(endpoint, params);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw createHttpError(response.status);
        }
        
        return await response.json();
    } catch (error) {
        throw error;
    }
}

function buildApiUrl(endpoint, params) {
    let baseUrl = apiConfig.baseUrl;
    
    if (endpoint === 'direct' || endpoint === 'reverse') {
        baseUrl = apiConfig.geoUrl;
    }
    
    const url = new URL(`${baseUrl}/${endpoint}`);
    
    url.searchParams.append('appid', apiConfig.apiKey);
    url.searchParams.append('units', apiConfig.units);
    url.searchParams.append('lang', apiConfig.lang);
    
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    
    return url.toString();
}

function createHttpError(status) {
    let message = 'An error occurred while fetching data';
    
    switch (status) {
        case 401:
            message = 'Invalid API key';
            break;
        case 404:
            message = 'Location not found';
            break;
        case 429:
            message = 'Too many requests. Please try again later';
            break;
        case 500:
            message = 'Server error. Please try again later';
            break;
    }
    
    const error = new Error(message);
    error.status = status;
    return error;
}

async function geocodeLocation(location) {
    try {
        const url = buildApiUrl('direct', {
            q: location,
            limit: 5
        });
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw createHttpError(response.status);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error('Location not found');
        }
        
        return data.map(item => ({
            name: item.name,
            country: item.country,
            state: item.state,
            lat: item.lat,
            lon: item.lon
        }));
    } catch (error) {
        throw error;
    }
}

function displayCurrentWeather(data) {
    if (!data) return;
    
    if (elements.locationName) {
        elements.locationName.textContent = `${data.name}, ${data.sys.country}`;
    }
    
    if (elements.temperatureValue) {
        elements.temperatureValue.textContent = Math.round(data.main.temp);
    }
    
    if (elements.conditionValue) {
        elements.conditionValue.textContent = data.weather[0].description;
    }
    
    if (elements.humidityValue) {
        elements.humidityValue.textContent = data.main.humidity;
    }
    
    if (elements.windSpeedValue) {
        elements.windSpeedValue.textContent = data.wind.speed;
    }
    
    if (elements.feelsLikeValue) {
        elements.feelsLikeValue.textContent = Math.round(data.main.feels_like);
    }
    
    if (elements.pressureValue) {
        elements.pressureValue.textContent = data.main.pressure;
    }
    
    if (data.weather && data.weather.length > 0) {
        const icon = data.weather[0].icon;
        setWeatherBackground(icon);
    } else {
        resetWeatherBackground();
    }
}

function displayForecast(data) {
    if (!data || !elements.forecastGrid) return;
    
    elements.forecastGrid.innerHTML = '';
    
    const dailyForecasts = processForecastData(data);
    
    dailyForecasts.forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        
        const date = new Date(forecast.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        forecastCard.innerHTML = `
            <div class="forecast-date">${dayName}<br>${monthDay}</div>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${forecast.icon}@2x.png" alt="${forecast.description}">
            <div class="forecast-temp">${Math.round(forecast.temp)}°C</div>
            <div class="forecast-condition">${forecast.description}</div>
        `;
        
        elements.forecastGrid.appendChild(forecastCard);
    });
}

function processForecastData(data) {
    if (!data || !data.list) return [];
    
    const dailyForecasts = [];
    const dailyMap = new Map();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toISOString().split('T')[0];
        
        if (!dailyMap.has(day)) {
            dailyMap.set(day, {
                date: date,
                temp: item.main.temp,
                icon: item.weather[0].icon,
                description: item.weather[0].description
            });
        }
    });
    
    dailyMap.forEach(forecast => {
        dailyForecasts.push(forecast);
    });
    
    return dailyForecasts.slice(0, 5);
}

function createMockHistoricalData(forecastData) {
    if (!forecastData || !forecastData.list) return null;
    
    const today = new Date();
    const historicalData = {
        dates: [],
        temperatures: [],
        humidity: []
    };
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        historicalData.dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const baseTempIndex = Math.min(i, forecastData.list.length - 1);
        const baseTemp = forecastData.list[baseTempIndex].main.temp;
        const randomVariation = Math.random() * 6 - 3;
        historicalData.temperatures.push(baseTemp + randomVariation);
        
        const baseHumidity = forecastData.list[baseTempIndex].main.humidity;
        const humidityVariation = Math.random() * 10 - 5;
        historicalData.humidity.push(baseHumidity + humidityVariation);
    }
    
    return historicalData;
}

function displayHistoricalData(data) {
    if (!data || !elements.historicalDataChart) return;
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(elements.historicalDataChart, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: data.temperatures,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.2)',
                                        label: 'Temperature (°C)',
                    data: data.temperatures,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Humidity (%)',
                    data: data.humidity,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    cornerRadius: 4
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function showLocationSelector(locations) {
    if (!elements.locationSelector || !elements.locationOptions) return;
    
    elements.locationOptions.innerHTML = '';
    
    locations.forEach(location => {
        const option = document.createElement('div');
        option.className = 'location-option';
        
        let locationText = location.name;
        if (location.state) locationText += `, ${location.state}`;
        if (location.country) locationText += `, ${location.country}`;
        
        option.textContent = locationText;
        
        option.addEventListener('click', async () => {
            elements.locationSelector.style.display = 'none';
            
            savePreviousSearch(location.name, location.lat, location.lon);
            
            try {
                await fetchWeatherByCoords({
                    lat: location.lat,
                    lon: location.lon
                });
            } catch (error) {
                showError(error.message || 'Failed to fetch weather data');
                resetWeatherBackground();
            }
        });
        
        elements.locationOptions.appendChild(option);
    });
    
    elements.locationSelector.style.display = 'block';
}

function validateLocationInput(location) {
    if (!location) {
        return {
            isValid: false,
            errorMessage: 'Please enter a city name'
        };
    }
    
    const validCharsRegex = /^[a-zA-Z\s,.'-]+$/;
    if (!validCharsRegex.test(location)) {
        return {
            isValid: false,
            errorMessage: 'City name should only contain letters, spaces, and basic punctuation'
        };
    }
    
    if (location.length < 2 || location.length > 50) {
        return {
            isValid: false,
            errorMessage: 'City name should be between 2 and 50 characters'
        };
    }
    
    return {
        isValid: true,
        errorMessage: ''
    };
}

function savePreviousSearch(location, lat, lon) {
    const search = {
        name: location,
        lat: lat,
        lon: lon,
        timestamp: new Date().toISOString()
    };
    
    let searches = JSON.parse(localStorage.getItem('weatherSearches')) || [];
    
    const existingIndex = searches.findIndex(item => 
        item.lat === lat && item.lon === lon
    );
    
    if (existingIndex !== -1) {
        searches.splice(existingIndex, 1);
    }
    
    searches.unshift(search);
    
    if (searches.length > 10) {
        searches = searches.slice(0, 10);
    }
    
    localStorage.setItem('weatherSearches', JSON.stringify(searches));
}

function getPreviousSearches() {
    return JSON.parse(localStorage.getItem('weatherSearches')) || [];
}

function showPreviousSearches() {
    if (!elements.previousSearches) return;
    
    const searches = getPreviousSearches();
    
    if (searches.length === 0) {
        elements.previousSearches.innerHTML = '<p class="no-searches">No previous searches</p>';
        return;
    }
    
    elements.previousSearches.innerHTML = '';
    
    searches.forEach(search => {
        const searchItem = document.createElement('div');
        searchItem.className = 'previous-search';
        
        const date = new Date(search.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        searchItem.innerHTML = `
            <h3>${search.name}</h3>
            <p>${formattedDate}</p>
        `;
        
        searchItem.addEventListener('click', () => {
            fetchWeatherByCoords({
                lat: search.lat,
                lon: search.lon
            });
        });
        
        elements.previousSearches.appendChild(searchItem);
    });
}

function showLoading(show) {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    if (!elements.errorMessage) return;
    
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
    
    setTimeout(() => {
        elements.errorMessage.style.display = 'none';
    }, 3000);
}

function clearWeatherDisplay() {
    if (elements.locationName) elements.locationName.textContent = '';
    if (elements.temperatureValue) elements.temperatureValue.textContent = '--';
    if (elements.conditionValue) elements.conditionValue.textContent = '--';
    if (elements.humidityValue) elements.humidityValue.textContent = '--';
    if (elements.windSpeedValue) elements.windSpeedValue.textContent = '--';
    if (elements.feelsLikeValue) elements.feelsLikeValue.textContent = '--';
    if (elements.pressureValue) elements.pressureValue.textContent = '--';
    
    if (elements.forecastGrid) elements.forecastGrid.innerHTML = '';
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}

window.addEventListener('resize', () => {
    if (rainAnimationActive) {
        stopRainAnimation();
        startRainAnimation();
    }
});

document.addEventListener('DOMContentLoaded', initApp);