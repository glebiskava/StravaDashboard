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
@analytics_bp.route("/vo2max", methods=["GET"])
def get_vo2max():
    RESTING_HEART_RATE = 42

    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT max_heartrate
        FROM activities
        WHERE max_heartrate IS NOT NULL
    """)

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify({"message": "Insufficient data"}), 400

    vo2max_list = []

    for (max_hr,) in rows:
        if max_hr <= RESTING_HEART_RATE:
            continue  # avoid divide-by-zero or nonsensical values

        # VO2 max formula (example using maxHR / restingHR * 15)
        vo2max = (max_hr / RESTING_HEART_RATE) * 15
        vo2max_list.append(vo2max)

    if not vo2max_list:
        return jsonify({"message": "No valid VO₂ max calculations"}), 400

    average_vo2max = sum(vo2max_list) / len(vo2max_list)
    print(average_vo2max, max_hr)
    return jsonify({
        "estimated_vo2max": round(average_vo2max, 2),
        "resting_hr": RESTING_HEART_RATE,
    })
    
@analytics_bp.route("/heartrate-zones", methods=["GET"])
def heartrate_zones():
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT average_heartrate, moving_time
        FROM activities
        WHERE average_heartrate IS NOT NULL AND moving_time > 0
    """)
    rows = cursor.fetchall()
    conn.close()

    zones = {
        "Z1": {"label": "Zone 1: 122–149", "time": 0},
        "Z2": {"label": "Zone 2: 149–166", "time": 0},
        "Z3": {"label": "Zone 3: 166–176", "time": 0},
        "Z4": {"label": "Zone 4: 176–187", "time": 0},
        "Z5": {"label": "Zone 5: 187–218", "time": 0},
    }

    total_time = 0
    for hr, time in rows:
        total_time += time
        if 122 <= hr < 149:
            zones["Z1"]["time"] += time
        elif 149 <= hr < 166:
            zones["Z2"]["time"] += time
        elif 166 <= hr < 176:
            zones["Z3"]["time"] += time
        elif 176 <= hr < 187:
            zones["Z4"]["time"] += time
        elif 187 <= hr <= 218:
            zones["Z5"]["time"] += time

    if total_time == 0:
        return jsonify([])

    result = [
        {
            "name": zone,
            "value": round((z["time"] / total_time) * 100, 2),
            "tooltip": z["label"]
        }
        for zone, z in zones.items() if z["time"] > 0
    ]

    return jsonify(result)
