# Weather App

![Weather App Banner](https://raw.githubusercontent.com/Ramanchaudhary2005/Weather_App/main/banner.png)

## Description

A modern, interactive weather application that provides real-time weather information with dynamic backgrounds based on current weather conditions. The app features current weather data, 5-day forecasts, and simulated historical weather information presented through interactive charts.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Real-time Weather Data:** View current temperature, conditions, humidity, wind speed, and more
- **Dynamic Backgrounds:** Background images change based on weather conditions
- **Weather Animations:** Rain animation for rainy and stormy conditions
- **5-Day Forecast:** Detailed weather forecast for the next five days
- **Historical Weather Data:** Visualized temperature and humidity trends
- **Location Search:** Search for weather by city name
- **Geolocation:** Automatically detect and display weather for user's current location
- **Search History:** Quick access to previously searched locations
- **Responsive Design:** Optimized for all devices from mobile to desktop
- **Intuitive UI:** Clean, modern interface with smooth transitions

---

## Demo

Live demo: [Weather App Demo](https://github.com/Ramanchaudhary2005/Weather_App)

![Weather App Screenshot](https://raw.githubusercontent.com/Ramanchaudhary2005/Weather_App/main/screenshot.png)

---

## Installation

### Prerequisites

- Modern web browser
- API key from [OpenWeatherMap](https://openweathermap.org/api)

### Steps

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Ramanchaudhary2005/Weather_App.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd Weather_App
    ```

3. **Open `script.js` and replace the API key:**

    ```javascript
    const apiConfig = {
        apiKey: 'YOUR_API_KEY_HERE'
    };
    ```

4. **Open `index.html` in your browser or deploy to a web server.**

---

## Usage

- **Search for a location:**
  - Enter a city name in the search bar
  - Press Enter or click the Search button

- **View current weather:**
  - Current temperature
  - Weather condition
  - Humidity
  - Wind speed
  - Atmospheric pressure
  - "Feels like" temperature

- **Check the forecast:**
  - 5-day weather forecast
  - Daily high/low temperatures
  - Weather conditions

- **View historical data:**
  - Temperature trends
  - Humidity patterns

- **Access previous searches:**
  - Click on any location in the search history section

---

## Technologies

- HTML5
- CSS3 (Flexbox, CSS Grid, CSS Variables, CSS Animations, Media Queries)
- JavaScript (ES6+)
- Fetch API, Async/Await
- LocalStorage
- Geolocation API
- [Chart.js](https://www.chartjs.org/) - For data visualization
- [Font Awesome](https://fontawesome.com/) - For icons
- [OpenWeatherMap API](https://openweathermap.org/api) - For weather data

---

## API Reference

This application uses the OpenWeatherMap API to fetch weather data:

| API Endpoint                                 | Description                      |
|-----------------------------------------------|----------------------------------|
| `api.openweathermap.org/data/2.5/weather`     | Current weather data             |
| `api.openweathermap.org/data/2.5/forecast`    | 5-day weather forecast           |
| `api.openweathermap.org/geo/1.0/direct`       | Geocoding (city name to coords)  |

For full API documentation, visit [OpenWeatherMap API Docs](https://openweathermap.org/api).

---

## Project Structure

```
Weather_App/
├── index.html         # Main HTML document
├── styles.css         # Main stylesheet
├── reset.css          # CSS reset and base styles
├── script.js          # Application logic and API integration
├── manifest.json      # Web app manifest for PWA support
└── README.md          # Project documentation
```

---

## Configuration

The app can be configured by modifying the following settings in `script.js`:

```javascript
const apiConfig = {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    geoUrl: 'https://api.openweathermap.org/geo/1.0',
    apiKey: 'YOUR_API_KEY_HERE', // Replace with your own API key
    units: 'metric', // Can be changed to 'imperial' for Fahrenheit
    lang: 'en' // Language code for API responses
};
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Created by [Raman Chaudhary](mailto:ramanch7890@gmail.com)