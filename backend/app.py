from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import sqlite3
import requests
import os
import time
import json

from summary import summary_bp
from user import user_bp
from analytics import analytics_bp

load_dotenv()

app = Flask(__name__)

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
STRAVA_REFRESH_TOKEN = os.getenv("STRAVA_REFRESH_TOKEN")
STRAVA_API_URL = "https://www.strava.com/api/v3"
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_API_KEY")

TOKEN_FILE = "token.json"

CORS(app, resources={r"/api/*": {"origins": ["*"]}})

@app.route("/api/google-maps-key", methods=["GET"])
def get_google_maps_key():
    """Returns API key ONLY if request is from localhost"""
    if request.remote_addr not in ["127.0.0.1", "localhost"]:
        return jsonify({"error": "Unauthorized"}), 403  # Block unauthorized access
    
    return jsonify({"apiKey": GOOGLE_MAPS_API_KEY})

def load_token():
    """Load access token and expiry time from a file."""
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "r") as file:
            try:
                token_data = json.load(file)
                return token_data.get("access_token"), token_data.get("expires_at")
            except json.JSONDecodeError:
                return None, 0
    return None, 0

def save_token(access_token, expires_at):
    """Save access token and expiry time to a file."""
    with open(TOKEN_FILE, "w") as file:
        json.dump({"access_token": access_token, "expires_at": expires_at}, file)

def get_access_token():
    """Check if the access token is expired and refresh only if needed."""
    access_token, expires_at = load_token()

    # If token is still valid (at least 5 minutes left), return it
    if access_token and time.time() < expires_at - 300:  # 5 minutes before expiry
        return access_token

    print("Refreshing Strava access token...")

    response = requests.post(
        "https://www.strava.com/oauth/token",
        data={
            "client_id": STRAVA_CLIENT_ID,
            "client_secret": STRAVA_CLIENT_SECRET,
            "refresh_token": STRAVA_REFRESH_TOKEN,
            "grant_type": "refresh_token",
        },
    )

    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data["access_token"]
        expires_at = token_data["expires_at"]  # Strava provides expiry timestamp

        # Save the new token to the file
        save_token(access_token, expires_at)

        return access_token
    else:
        print("Error refreshing access token:", response.text)
        return None  # Handle errors gracefully

@app.route("/activities", methods=["GET"])
def get_activities():
    """Fetch only 10 latest activities from Strava API and store them in SQLite, including polylines."""
    access_token = get_access_token()
    if not access_token:
        return jsonify({"error": "Could not get access token"}), 401

    headers = {"Authorization": f"Bearer {access_token}"}

    # Request only 10 activities (Strava allows per_page = 10)
    response = requests.get(
        f"{STRAVA_API_URL}/athlete/activities",
        headers=headers,
        params={"page": 1, "per_page": 100},  # Limit results to 10 activities
    )
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch activities"}), 500
    
    all_activities = response.json()  # Should contain only 10 activities

    # Store activities in the database
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    # Drop table if it exists to refresh data
    print("Dropping table")
    cursor.execute("DROP TABLE IF EXISTS activities")

    # Create the database schema
    cursor.execute(
        """CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY,
            name TEXT,
            distance REAL,
            moving_time INTEGER,
            average_speed REAL,
            max_speed REAL,
            average_cadence REAL,
            average_temp INTEGER,
            has_heartrate BOOLEAN,
            average_heartrate REAL,
            max_heartrate REAL,
            elev_high REAL,
            elev_low REAL,
            calories REAL,
            total_elevation_gain REAL,
            start_date TEXT,
            type TEXT,
            sport_type TEXT,
            location_country TEXT,
            kudos_count INTEGER,
            polyline TEXT
        )"""
    )

    for act in all_activities:
        # Extract polyline safely
        polyline = act.get("map", {}).get("polyline") or act.get("map", {}).get("summary_polyline")

        cursor.execute(
            """INSERT INTO activities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                act["id"],
                act["name"],
                act["distance"],
                act["moving_time"],
                act.get("average_speed", None),
                act.get("max_speed", None),
                act.get("average_cadence", None),
                act.get("average_temp", None),
                act.get("has_heartrate", False),
                act.get("average_heartrate", None),
                act.get("max_heartrate", None),
                act.get("elev_high", None),
                act.get("elev_low", None),
                act.get("calories", None),
                act["total_elevation_gain"],
                act["start_date"],
                act["type"],
                act["sport_type"],
                act.get("location_country", None),
                act.get("kudos_count", 0),
                polyline,  # Store the extracted polyline
            ),
        )

    print("Activities inserted successfully")

    conn.commit()
    conn.close()
    
    return jsonify(all_activities)

@app.route("/activities/local", methods=["GET"])
def get_local_activities():
    """Retrieves stored activities from SQLite database, ordered by start date (newest first)."""
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM activities ORDER BY start_date DESC")
    activities = cursor.fetchall()
    conn.close()

    if not activities:
        return jsonify([]), 200  # Ensure JSON format when no data

    activity_keys = [
        "id", "name", "distance", "moving_time", "average_speed", "max_speed",
        "average_cadence", "average_temp", "has_heartrate", "average_heartrate",
        "max_heartrate", "elev_high", "elev_low", "calories",
        "total_elevation_gain", "start_date", "type", "sport_type",
        "location_country", "kudos_count", "polyline"
    ]

    activities_json = [dict(zip(activity_keys, row)) for row in activities]

    return jsonify(activities_json), 200

@app.route("/activity_polyline/<int:activity_id>", methods=["GET"])
def get_activity_polyline(activity_id):
    """Retrieve polyline from SQLite instead of making an extra API call."""
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    cursor.execute("SELECT polyline FROM activities WHERE id = ?", (activity_id,))
    result = cursor.fetchone()
    
    conn.close()

    if result and result[0]:  
        return jsonify({"polyline": result[0]})
    else:
        return jsonify({"error": "Polyline not found"}), 404

# Register the blueprints
app.register_blueprint(summary_bp)
app.register_blueprint(user_bp)
app.register_blueprint(analytics_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
