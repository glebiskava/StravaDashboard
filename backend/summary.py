from flask import Blueprint, jsonify
import sqlite3
from datetime import datetime, timedelta

summary_bp = Blueprint("summary", __name__)

@summary_bp.route("/summary/weekly", methods=["GET"])
def get_weekly_summary():
    """Returns the total distance, elevation gain, and time for the past 7 days."""
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    # Calculate 7 days ago
    seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()

    cursor.execute("""
        SELECT SUM(distance), SUM(total_elevation_gain), SUM(moving_time)
        FROM activities WHERE start_date >= ?
    """, (seven_days_ago,))

    result = cursor.fetchone()
    conn.close()

    if result is None:
        return jsonify({"total_distance": 0, "total_elevation": 0, "total_time": 0}), 200

    return jsonify({
        "total_distance": result[0] / 1000 if result[0] else 0,  # Convert to km
        "total_elevation": result[1] if result[1] else 0,
        "total_time": result[2] if result[2] else 0
    }), 200
