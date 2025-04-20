from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
import sqlite3

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/summary/training-load", methods=["GET"])
def get_training_load():
    start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()

    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DATE(start_date), SUM(distance), COUNT(*) as activity_count
        FROM activities
        WHERE DATE(start_date) >= ?
        GROUP BY DATE(start_date)
        ORDER BY DATE(start_date)
    """, (start_date,))

    data = cursor.fetchall()
    conn.close()

    result = [
        {
            "date": row[0],
            "distance": row[1] / 1000,  # convert to km
            "count": row[2]
        }
        for row in data
    ]
    return jsonify(result)
