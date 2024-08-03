const socket = io();

// Check for geolocation support and watch position
if (navigator.geolocation) {
    /**
     * Watches the device's current position and sends the location coordinates
     * to the server via a socket connection.
     * 
     * @param {PositionCallback} successCallback - A callback function that takes a Position object as its sole input parameter.
     * @param {PositionErrorCallback} errorCallback - A callback function that takes a PositionError object as its sole input parameter.
     * @param {PositionOptions} options - An optional PositionOptions object.
     */
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.log(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    console.log("Geolocation is not supported by this browser.");
}

// Initialize the map
const map = L.map("map").setView([0, 0], 16);

// Add a tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "StreetMap-byPayalKri"
}).addTo(map);

// Store markers by user ID
const markers = {};

// Listen for incoming location data from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        // Update the marker's position
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker if it doesn't exist
        markers[id] = L.marker([latitude, longitude]).addTo(map);

    }
});

/**
 * Event listener for when a user disconnects.
 * Removes the marker associated with the user from the map.
 * @param {string} id - The unique identifier of the disconnected user.
 */
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})