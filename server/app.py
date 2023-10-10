from flask import Flask
import os
import psycopg2

def get_db_connection() {
  return connection = psycopg2.connect(
    host="localhost",
    database="music",
    user=os.environ['DB_USERNAME'],
    password=os.environ['DB_PASSWORD'])
}


app = Flask(__name__)

@app.post("/track")
def track_create():
  conn = get_db_connection()
  cur = conn.cursor()
  cur.execute("INSERT INTO tracks (name, artist, album) VALUES (%s, %s, %s)", (name, artist, album))
