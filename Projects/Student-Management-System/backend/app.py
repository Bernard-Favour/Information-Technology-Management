from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

students = []


@app.route("/")
def home():
    return jsonify({
        "message": "Student Management System API is running!"
    })


@app.route("/api/students", methods=["GET"])
def get_students():

    with psycopg.connect(**DB_CONFIG) as conn:

        with conn.cursor() as cur:

            cur.execute("""
                SELECT id, name, email, program
                FROM students
                ORDER BY id
            """)

            rows = cur.fetchall()

    students = []

    for row in rows:
        students.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "program": row[3]
        })

    return jsonify(students)


@app.route("/api/students", methods=["POST"])
def add_student():

    student = request.get_json()

    with psycopg.connect(**DB_CONFIG) as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                INSERT INTO students (id, name, email, program)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    student["id"],
                    student["name"],
                    student["email"],
                    student["program"]
                )
            )

            conn.commit()

    return jsonify({
        "message": "Student added successfully!",
        "student": student
    }), 201


@app.route("/api/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):

    with psycopg.connect(**DB_CONFIG) as conn:

        with conn.cursor() as cur:

            cur.execute(
                "DELETE FROM students WHERE id = %s",
                (student_id,)
            )

            conn.commit()

    return jsonify({
        "message": "Student deleted successfully!"
    })


if __name__ == "__main__":
    app.run(debug=True)
    