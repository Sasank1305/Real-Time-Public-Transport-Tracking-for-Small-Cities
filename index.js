const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// In-memory storage for bus locations
// Each busId maps to { lat, lon, timestamp }
const busLocations = {};

// Cleanup interval (remove locations older than 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const busId in busLocations) {
        const age = now - new Date(busLocations[busId].timestamp).getTime();
        if (age > CLEANUP_INTERVAL_MS) {
            delete busLocations[busId];
            io.emit('busRemoved', busId); // notify clients
            console.log(`Removed old location for bus ${busId}`);
        }
    }
}, CLEANUP_INTERVAL_MS);

// Endpoint for buses to post their location
app.post('/api/update', (req, res) => {
    const { busId, lat, lon } = req.body;

    if (!busId || typeof lat !== 'number' || typeof lon !== 'number') {
        return res.status(400).json({ error: 'Invalid data. busId, lat, and lon required (lat/lon must be numbers).' });
    }

    const locationData = { busId, lat, lon, timestamp: new Date() };
    busLocations[busId] = locationData;

    // Broadcast the new location to all clients
    io.emit('locationUpdate', locationData);

    console.log(`Updated location for ${busId}: ${lat}, ${lon}`);
    res.status(200).json({ message: 'Location updated', locationData });
});

// Endpoint to get all current bus locations
app.get('/api/locations', (req, res) => {
    res.json(Object.values(busLocations));
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A client connected');

    // Send current bus locations to new client
    socket.emit('initialLocations', Object.values(busLocations));

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Use Render's environment PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
