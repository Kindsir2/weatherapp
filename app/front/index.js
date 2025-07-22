// Select DOM elements for user interaction and weather display
const searchBox = document.querySelector('.search');
const searchBtn = document.querySelector('.serch-button');
const weatherIcon = document.querySelector(".sun");

/* Fetches weather data for a city from the backend,
  updates the UI, saves the result, and refreshes the history table.*/
async function checkWeather(city) {
    try {
        // Save weather data to server and get the response
        const { temp, humidity, windspeed, condition } = await saveWeatherToServer({
            city: city
        });

        // Update weather display
        document.querySelector(".city").innerHTML = city;
        document.querySelector(".temp").innerHTML = `${Math.round(temp)}°C`;
        document.querySelector(".humid-text").innerHTML = `${humidity}% Humidity`;
        document.querySelector(".wind-text").innerHTML = `${windspeed} km/h Windspeed`;

        // Change weather icon based on condition
        if (condition.includes("cloud")) {
            weatherIcon.src = "images/cloudy.png";
        } else if (condition.includes("mist")) {
            weatherIcon.src = "images/misty.png";
        } else if (condition.includes("clear")) {
            weatherIcon.src = "images/clear.png";
        } else if (condition.includes("rain")) {
            weatherIcon.src = "images/rain.png";
        } else if (condition.includes("drizzle")) {
            weatherIcon.src = "images/drizzle.png";
        } else {
            weatherIcon.src = "images/default.png";
        }

        // Refresh the weather history table
        await fetchWeatherHistory();
    } catch (error) {
        alert("City not found. Please try again.");
    }
}

/*Sends a POST request to the backend to save weather data for a city.
  Returns the saved weather data.*/
async function saveWeatherToServer(weatherData) {
    const res = await fetch('/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weatherData)
    });

    return await res.json();
}

 // Fetches all weather history from the backend and renders the table.
async function fetchWeatherHistory() {
    const response = await fetch('/weather');
    const data = await response.json();
    renderWeatherTable(data);
}

//Render the weather history table.
function renderWeatherTable(data) {
    let table = `<table>
        <thead>
            <tr>
                <th>City</th>
                <th>Temp (°C)</th>
                <th>Humidity (%)</th>
                <th>Windspeed (km/h)</th>
                <th>Timestamp</th>
                <th>Condition</th>
            </tr>
        </thead>
        <tbody>`;
    data.forEach(item => {
        table += `<tr>
            <td>${item.city}</td>
            <td>${item.temp}</td>
            <td>${item.humidity}</td>
            <td>${item.windspeed}</td>
            <td>${item.timestamp}</td>
            <td>${item.condition}</td>
        </tr>`;
    });
    table += '</tbody></table>';
    document.querySelector(".weather-table").innerHTML = table;
}

// Event listeners for search button and Enter key
searchBtn.addEventListener('click', () => {
    checkWeather(searchBox.value.trim());
});

searchBox.addEventListener('keypress', (event) => {
    if (event.key === "Enter") {
        checkWeather(searchBox.value.trim());
    }
});

// On first page load, show the weather history table
fetchWeatherHistory();