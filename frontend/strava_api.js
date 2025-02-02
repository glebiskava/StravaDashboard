document.addEventListener("DOMContentLoaded", function () {
    fetch("http://127.0.0.1:5000/activities/local")
        .then(response => response.json())
        .then(data => {
            // Ensure the array is sorted in descending order (newest first)
            data.sort((a, b) => new Date(b[5]) - new Date(a[5]));

            const activitiesDiv = document.getElementById("activities");
            activitiesDiv.innerHTML = ""; // Clear previous content

            data.forEach(activity => {
                const activityElement = document.createElement("div");
                activityElement.classList.add("activity");

                // Convert moving time to hh:mm format
                const formattedTime = formatTime(activity[3]);

                activityElement.innerHTML = `
                    <h2>${activity[1]}</h2>
                    <p><strong>Distance:</strong> ${(activity[2] / 1000).toFixed(2)} km</p>
                    <p><strong>Time:</strong> ${formattedTime}</p>
                    <p><strong>Elevation Gain:</strong> ${activity[4]} m</p>
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
        .catch(error => console.error("Error fetching activities:", error));
});


// Function to render Leaflet map with activity polyline
function renderMap(mapId, polylineData) {
    const decodedPolyline = decodePolyline(polylineData);

    if (decodedPolyline.length === 0) {
        console.error("Polyline is empty, skipping map rendering.");
        return;
    }

    // Create a map and fit bounds to polyline
    const map = L.map(mapId);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

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
