from flask import Flask, jsonify, request, send_from_directory
import sqlite3
import requests
import os

app = Flask(__name__, static_folder="../frontend")

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
STRAVA_REFRESH_TOKEN = os.getenv("STRAVA_REFRESH_TOKEN")
STRAVA_API_URL = "https://www.strava.com/api/v3"

def get_access_token():
    """Refresh and retrieve Strava API access token."""
    response = requests.post(
        "https://www.strava.com/oauth/token",
        data={
            "client_id": STRAVA_CLIENT_ID,
            "client_secret": STRAVA_CLIENT_SECRET,
            "refresh_token": STRAVA_REFRESH_TOKEN,
            "grant_type": "refresh_token",
        },
    )
    return response.json().get("access_token")


@app.route("/activities", methods=["GET"])
def get_activities():
    """Fetches activities from Strava API and stores them in SQLite."""
    access_token = get_access_token()
    if not access_token:
        return jsonify({"error": "Could not get access token"}), 401

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{STRAVA_API_URL}/athlete/activities?per_page=200", headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch activities"}), 500

    activities = response.json()

    # Store activities in the database
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    cursor.execute(
        """CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY,
            name TEXT,
            distance REAL,
            moving_time INTEGER,
            total_elevation_gain REAL,
            start_date TEXT
        )"""
    )

    for act in activities:
        cursor.execute(
            "INSERT OR IGNORE INTO activities VALUES (?, ?, ?, ?, ?, ?)",
            (act["id"], act["name"], act["distance"], act["moving_time"], act["total_elevation_gain"], act["start_date"]),
        )

    conn.commit()
    conn.close()

    return jsonify(activities)


@app.route("/activities/local", methods=["GET"])
def get_local_activities():
    """Retrieves stored activities from SQLite database, ordered by start date (newest first)."""
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM activities ORDER BY start_date DESC")
    activities = cursor.fetchall()
    conn.close()

    return jsonify(activities)



@app.route("/")
def serve_frontend():
    """Serves the main HTML page."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_static(path):
    """Serves static frontend files (JS, CSS)."""
    return send_from_directory(app.static_folder, path)

@app.route("/activity_polyline/<int:activity_id>", methods=["GET"])
def get_activity_polyline(activity_id):
    """Fetch the polyline for a specific activity."""
    access_token = get_access_token()
    if not access_token:
        return jsonify({"error": "Could not get access token"}), 401

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{STRAVA_API_URL}/activities/{activity_id}", headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch activity details"}), 500

    activity_data = response.json()
    polyline = activity_data.get("map", {}).get("polyline", "")

    return jsonify({"polyline": polyline})

if __name__ == "__main__":
    app.run(debug=True)
