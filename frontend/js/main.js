const BACKEND_URL = 'http://localhost:3000';

// Initialize the map and set its view to a default location
const map = L.map('map').setView([28.6139, 77.2090], 5); // Centered on India

// Add a tile layer to the map (using OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const busMarkers = {};
const busList = document.getElementById('bus-list');

// Function to update or create a bus marker
function updateMap(busData) {
    const { busId, lat, lon } = busData;
    const latLng = [lat, lon];

    if (busMarkers[busId]) {
        busMarkers[busId].setLatLng(latLng);
    } else {
        busMarkers[busId] = L.marker(latLng).addTo(map);
    }
    busMarkers[busId].bindPopup(`<b>${busId}</b>`);

    updateBusList(busData);
}

// Function to update the bus information list
function updateBusList(busData) {
    const { busId, lat, lon } = busData;
    let listItem = document.getElementById(`bus-${busId}`);

    if (!listItem) {
        listItem = document.createElement('li');
        listItem.id = `bus-${busId}`;
        busList.appendChild(listItem);
    }

    listItem.innerHTML = `<strong>${busId}</strong>: Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
}

// Connect to the backend with Socket.IO
const socket = io(BACKEND_URL);

socket.on('connect', () => {
    console.log('Connected to server');
});

// Handle initial locations sent by the server
socket.on('initialLocations', (locations) => {
    console.log('Received initial locations:', locations);
    locations.forEach(busData => {
        updateMap(busData);
    });
});

// Handle real-time location updates
socket.on('locationUpdate', (busData) => {
    console.log('Received location update:', busData);
    updateMap(busData);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
