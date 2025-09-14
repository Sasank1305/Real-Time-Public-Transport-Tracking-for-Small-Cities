const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity
        methods: ["GET", "POST"]
    }
});

// In-memory storage for bus locations
const busLocations = {};

// Endpoint for buses to post their location
app.post('/api/update', (req, res) => {
    const { busId, lat, lon } = req.body;
    if (!busId || !lat || !lon) {
        return res.status(400).send('Invalid data');
    }

    const locationData = { busId, lat, lon, timestamp: new Date() };
    busLocations[busId] = locationData;

    // Broadcast the new location to all connected clients
    io.emit('locationUpdate', locationData);
    
    console.log(`Updated location for ${busId}: ${lat}, ${lon}`);
    res.status(200).send('Location updated');
});

// Endpoint to get all current bus locations
app.get('/api/locations', (req, res) => {
    res.json(Object.values(busLocations));
});

io.on('connection', (socket) => {
    console.log('A client connected');
    // Send all current bus locations to the newly connected client
    socket.emit('initialLocations', Object.values(busLocations));

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
