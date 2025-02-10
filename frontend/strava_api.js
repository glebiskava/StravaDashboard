let THUNDERFOREST_API_KEY = "";

// Fetch API key from Flask before rendering the map
fetch("http://127.0.0.1:5000/api/thunderforest")
    .then(response => response.json())
    .then(config => {
        THUNDERFOREST_API_KEY = config.THUNDERFOREST_API_KEY;
        loadLocalActivities(); // Load activities after getting API key
    })
    .catch(error => console.error("Error fetching API key:", error));

// Function to fetch new activities when button is clicked
document.getElementById("fetch-new-activities").addEventListener("click", function () {
    fetch("http://127.0.0.1:5000/activities")
        .then(response => response.json())
        .then(data => {
            loadLocalActivities(); // Refresh the frontend after fetching
        })
        .catch(error => console.error("Error fetching new activities:", error));
});

// Function to load activities from /activities/local
function loadLocalActivities() {
    fetch("http://127.0.0.1:5000/activities/local")
        .then(response => response.json())
        .then(data => {
            const activitiesDiv = document.getElementById("activities");
            activitiesDiv.innerHTML = ""; // Clear previous activities

            data.forEach(activity => {
                const activityElement = document.createElement("div");
                activityElement.classList.add("activity");

                const formattedTime = formatTime(activity[3]);

                activityElement.innerHTML = `
                    <h2>${activity[1]}</h2>
                    <p><strong>Distance:</strong> ${(activity[2] / 1000).toFixed(2)} km</p>
                    <p><strong>Time:</strong> ${formattedTime}</p>
                    <p><strong>Elevation Gain:</strong> ${activity[14]} m</p>
                    <div id="map-${activity[0]}" class="map-container"></div>
                `;

                activitiesDiv.appendChild(activityElement);

                // Fetch polyline for the activity
                fetch(`http://127.0.0.1:5000/activity_polyline/${activity[0]}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.polyline) {
                            renderMap(`map-${activity[0]}`, data.polyline);
                        }
                    })
                    .catch(error => console.error("Error fetching polyline:", error));
            });
        })
        .catch(error => console.error("Error loading local activities:", error));
}

// Function to render Leaflet map with elevation (topographic) lines
function renderMap(mapId, polylineData) {
    if (!THUNDERFOREST_API_KEY) {
        console.error("No API key loaded! Map cannot be displayed.");
        return;
    }

    const decodedPolyline = decodePolyline(polylineData);

    if (decodedPolyline.length === 0) {
        console.error("Polyline is empty, skipping map rendering.");
        return;
    }

    // Create a Leaflet map
    const map = L.map(mapId);

    // Use Thunderforest Outdoors for elevation contour lines
    L.tileLayer(`https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${THUNDERFOREST_API_KEY}`, {
        attribution: "&copy; <a href='https://www.thunderforest.com/'>Thunderforest</a> contributors",
        maxZoom: 22,
    }).addTo(map);

    // Add polyline to the map
    const polyline = L.polyline(decodedPolyline, { color: "blue", weight: 4 }).addTo(map);

    // Adjust zoom to fit the polyline bounds dynamically
    map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
}

// Function to decode Google Maps encoded polylines
function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += dlng;

        points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
}

// Function to format time properly (1h22min or 30min)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        return `${hours}h${remainingMinutes.toString().padStart(2, "0")}min`;
    }
    return `${minutes}min`;
}
