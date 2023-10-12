from flask import Flask, request
from flask_cors import CORS, cross_origin
import os
import psycopg2

def get_db_connection():
  return psycopg2.connect(
    host="localhost",
    database="music",
    user=os.environ['DB_USERNAME'],
    password=os.environ['DB_PASSWORD'])


app = Flask(__name__)

@app.post("/track/create")
@cross_origin()
def track_create():
  request_data = request.get_json()
  conn = get_db_connection()
  cur = conn.cursor()

  cur.execute("SELECT projectid FROM projects WHERE projectid = %s", (request_data["projectId"]))
  projectid = cur.fetchone()
  if projectid is None:
    return 'project not found'

  cur.execute("INSERT INTO tracks (instrumenttype, contributeremail, url) VALUES (%s, %s, %s)", (request_data["instrumentType"], 'jack@nope.com', request_data["url"]))
  cur.execute("SELECT trackid FROM tracks WHERE url = %s", (request_data["url"],))
  trackId = cur.fetchone()

  cur.execute("INSERT INTO projecttracks (projectid, trackid, accepted) VALUES (%s, %s, false)", (request_data["projectId"], trackId))

  conn.commit()
  conn.close()
  cur.close()
  return 'success'

@app.post("/project/create")
@cross_origin()
def project_create():
  request_data = request.get_json()
  conn = get_db_connection()
  cur = conn.cursor()

  cur.execute("INSERT INTO projects (owner, projectname) VALUES (%s, %s)", ('jack@nope.com', request_data["projectName"]))
  conn.commit()

  conn.close()
  cur.close()
  return 'success'

@app.get("/tracks/list")
@cross_origin()
def project_get():
  conn = get_db_connection()
  cur = conn.cursor()

  cur.execute("SELECT url, instrumenttype, accepted FROM projects join projecttracks on projects.projectid = projecttracks.projectid join tracks on projecttracks.trackid = tracks.trackid where projects.projectid = %s", request.args.get("projectId"))
  tracks = cur.fetchall()

  conn.close()
  cur.close()
  return str(tracks)
