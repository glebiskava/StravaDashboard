from flask import Blueprint, jsonify
import sqlite3
from datetime import datetime, timedelta

summary_bp = Blueprint("summary", __name__)

@summary_bp.route("/summary/weekly", methods=["GET"])
def get_weekly_summary():
    """Returns the total distance, elevation gain, and time starting from the beginning of the current week (Monday)."""
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    # Determine start of the current week (Monday, 00:00 UTC)
    now = datetime.utcnow()
    days_since_monday = now.weekday()  # Monday = 0, Sunday = 6
    start_of_week = datetime(now.year, now.month, now.day) - timedelta(days=days_since_monday)
    start_of_week_iso = start_of_week.isoformat()

    cursor.execute("""
        SELECT SUM(distance), SUM(total_elevation_gain), SUM(moving_time)
        FROM activities
        WHERE start_date >= ?
    """, (start_of_week_iso,))

    result = cursor.fetchone()
    conn.close()

    if result is None:
        return jsonify({
            "total_distance": 0,
            "total_elevation": 0,
            "total_time": 0
        }), 200

    return jsonify({
        "total_distance": result[0] / 1000 if result[0] else 0,  # meters to km
        "total_elevation": result[1] if result[1] else 0,
        "total_time": result[2] if result[2] else 0
    }), 200
    
@summary_bp.route("/summary/monthly-type", methods=["GET"])
def get_monthly_type_summary():
    """Returns top 3 activity types and their total distance (in km) for the last month."""
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    # Calculate first and last day of last month
    now = datetime.utcnow()
    first_day_this_month = datetime(now.year, now.month, 1)
    last_month = first_day_this_month.replace(day=1) - timedelta(days=1)
    first_day_last_month = datetime(last_month.year, last_month.month, 1)
    last_day_last_month = datetime(last_month.year, last_month.month, last_month.day, 23, 59, 59)

    cursor.execute("""
        SELECT sport_type, SUM(distance) / 1000.0 as km
        FROM activities
        WHERE start_date BETWEEN ? AND ?
        GROUP BY sport_type
        ORDER BY km DESC
        LIMIT 3
    """, (first_day_last_month.isoformat(), last_day_last_month.isoformat()))

    result = cursor.fetchall()
    conn.close()

    return jsonify([
        {"sport_type": row[0], "distance_km": round(row[1], 2)}
        for row in result
    ])
