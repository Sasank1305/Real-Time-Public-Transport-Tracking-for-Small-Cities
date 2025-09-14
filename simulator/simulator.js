const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000/api/update';

// Define simple routes for two buses as a series of coordinates
const routes = {
    'Bus-01': [
        { lat: 28.6139, lon: 77.2090 }, // Delhi
        { lat: 28.5355, lon: 77.3910 }, // Noida
        { lat: 28.4595, lon: 77.0266 }, // Gurgaon
    ],
    'Bus-02': [
        { lat: 19.0760, lon: 72.8777 }, // Mumbai
        { lat: 19.0213, lon: 72.8424 }, // Dadar
        { lat: 19.1176, lon: 72.8631 }, // Andheri
    ],
};

const busState = {
    'Bus-01': { routeIndex: 0 },
    'Bus-02': { routeIndex: 0 },
};

async function updateBusLocation(busId) {
    const state = busState[busId];
    const route = routes[busId];

    // Move to the next point in the route
    state.routeIndex = (state.routeIndex + 1) % route.length;
    const { lat, lon } = route[state.routeIndex];

    try {
        await axios.post(BACKEND_URL, { busId, lat, lon });
        console.log(`Sent location for ${busId}: ${lat}, ${lon}`);
    } catch (error) {
        console.error(`Error updating location for ${busId}:`, error.message);
    }
}

console.log('Starting bus simulator...');
// Update location for each bus every 5 seconds
setInterval(() => updateBusLocation('Bus-01'), 5000);
setInterval(() => updateBusLocation('Bus-02'), 5000);
