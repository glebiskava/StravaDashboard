from flask import Blueprint, request, jsonify
import sqlite3

user_bp = Blueprint("user", __name__)

@user_bp.route("/user", methods=["GET"])
def get_user_profile():
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name, age, height, weight FROM user_profile WHERE id = 1")
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify({
            "name": row[0],
            "age": row[1],
            "height": row[2],
            "weight": row[3],
        })
    return jsonify({"error": "Profile not found"}), 404

@user_bp.route("/user", methods=["POST"])
def update_user_profile():
    data = request.json
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user_profile
        SET name = ?, age = ?, height = ?, weight = ?
        WHERE id = 1
    """, (data.get("name"), data.get("age"), data.get("height"), data.get("weight")))
    conn.commit()
    conn.close()
    return jsonify({"message": "Profile updated successfully"})

@user_bp.route("/user/reset", methods=["PUT"])
def reset_user_profile():
    conn = sqlite3.connect("strava.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE user_profile SET name = '', age = 0, height = 0, weight = 0 WHERE id = 1")
    conn.commit()
    conn.close()
    return jsonify({"message": "Profile reset successfully"})
