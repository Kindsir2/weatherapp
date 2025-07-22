const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect or create SQLite database
const db = new Database('weather.db');

// Create the weather table if it doesn't exist
const createTable = `
  CREATE TABLE IF NOT EXISTS weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    temp REAL NOT NULL,
    humidity REAL NOT NULL,
    windspeed REAL NOT NULL,
    timestamp TEXT NOT NULL,
    condition TEXT NOT NULL
  )
`;
db.prepare(createTable).run();

// POST endpoint: receives a city, fetches weather data, and stores it
app.post('/weather', async (req, res) => {
  const { city } = req.body;

  //API
  const apiKey = "1df095195f35222a797661adcc8cb1c0";
  const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

  try {
    // Fetch weather data from the external API
    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    const now = new Date().toISOString();
    const cond = data.weather[0].main.toLowerCase();

    // Build the object to save
    const weatherToSave = {
      city: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      windspeed: data.wind.speed,
      timestamp: now,
      condition: cond
    };

    // Validate all required fields
    const { temp, humidity, windspeed, timestamp } = weatherToSave;
    if (!city || !temp || !humidity || !windspeed || !timestamp || !cond) {
      return res.status(400).json({ error: 'Missing fields in request body.' });
    }

    // Save the data in the database
    const stmt = db.prepare(`
      INSERT INTO weather (city, temp, humidity, windspeed, timestamp, condition)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(city, temp, humidity, windspeed, timestamp, cond);

    // Return the saved data to the frontend
    res.json({ city, temp, humidity, windspeed, timestamp, condition: cond });
  } catch (err) {
    // Error handling for API or database
    res.status(500).json({ error: err.message });
  }
});

// Get endpoint: returns all weather records, sorted by newest first
app.get('/weather', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM weather ORDER BY timestamp DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Path to the frontend
const publicPath = __dirname + '/../front';

// Serve static files (index.html, CSS, JS, images)
app.use(express.static(publicPath));

// Serve index.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(publicPath + '/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
