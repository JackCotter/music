from flask import Blueprint, jsonify, request
import flask_login
import os
import io
import boto3

from utils import get_db_connection

tracks_blueprint = Blueprint('tracks', __name__)
s3 = boto3.client('s3', aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'), aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'), region_name='us-east-2')

@tracks_blueprint.post("/tracks/create")
@flask_login.login_required
def track_create():
    request_data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT projectid FROM projects WHERE projectid = %s", (str(request_data["projectId"]),))
    projectid = cur.fetchone()
    if projectid is None:
        return 'project not found', 400
    if request_data["instrumentType"] not in ['Piano','Guitar','Bass','Drums','Saxophone','Trumpet','Violin','Cello','Vocals','Other']:
        return 'invalid instrument type', 400
    if request_data["title"] is None or request_data["description"] is None or request_data["blobData"] is None:
        return 'missing title, description, or blobData', 400
    if not isinstance(request_data["title"], str) or not isinstance(request_data["description"], str) or not isinstance(request_data["blobData"], str):
        return 'title, description, and blobData must be strings', 400
    if len(request_data["title"]) > 30 or len(request_data["description"]) > 100:
        return 'title must be less than 30 characters and description must be less than 100 characters', 400
    cur.execute("SELECT title FROM tracks natural join projecttracks WHERE title = %s and projectid = %s", (request_data["title"], projectid,))
    name_exists_in_project = cur.fetchone()
    if name_exists_in_project is not None:
        return 'track with that name already exists in project', 400

    cur.execute("SELECT max(blobid) + 1 FROM tracks")
    blobId = cur.fetchone();
    if blobId[0] is None:
        return 'Error generating blobId', 400

    try:
        blob_data_bytes = bytes(request_data["blobData"], 'ascii')
        buffer = io.BytesIO()
        buffer.write(blob_data_bytes)
        buffer.seek(0)
        s3.upload_fileobj(
            buffer, os.environ.get('S3_BUCKET_NAME'), "tracks/" + str(blobId[0]) + ".bin")
    except Exception as e:
        return 'Error uploading blob to S3', 400

    cur.execute("INSERT INTO tracks (instrumenttype, contributeremail, blobid, title, description) VALUES (%s, %s, %s, %s, %s)",
                (request_data["instrumentType"], flask_login.current_user.id, blobId[0], request_data["title"], request_data["description"]))
    cur.execute("SELECT trackid FROM tracks WHERE blobid = %s", (blobId[0],))
    trackId = cur.fetchone()

    cur.execute("INSERT INTO projecttracks (projectid, trackid, accepted) VALUES (%s, %s, false)",
                (request_data["projectId"], trackId))

    conn.commit()
    conn.close()
    cur.close()
    return 'success'

@tracks_blueprint.get("/tracks/list")
def track_list():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT tracks.trackid, blobid, instrumenttype, accepted, tracks.title, tracks.description FROM projects join projecttracks on projects.projectid = projecttracks.projectid join tracks on projecttracks.trackid = tracks.trackid where projects.projectid = %s", (request.args.get("projectId"),))
    tracks = cur.fetchall()

    formatted_tracks = []
    for row in tracks:
        try:
            temp_file_name = str(row[1]) + ".bin"
            s3.download_file(os.environ.get('S3_BUCKET_NAME'), "tracks/" + str(row[1]) + ".bin", temp_file_name)
            blob_data = open(temp_file_name, "rb").read()
            blob_data_str = str(blob_data, 'utf-8')
            os.remove(temp_file_name)
            formatted_tracks.append(
                {"trackId": row[0], "blobData": blob_data_str, "instrumentType": row[2], "accepted": row[3], "title": row[4], "description": row[5]})
        except Exception as e:
            print(e)
            continue

    conn.close()
    cur.close()
    return jsonify(formatted_tracks)


@tracks_blueprint.patch("/tracks/patch")
@flask_login.login_required
def track_patch():
    request_data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()

    if request_data["accepted"] is None or request_data["trackIds"] is None:
        return 'missing accepted or trackIds', 400
    if not isinstance(request_data["accepted"], bool) or not isinstance(request_data["trackIds"], list):
        return 'accepted must be a boolean and trackIds must be a list', 400
    if len(request_data["trackIds"]) == 0:
        return 'no changes made'
    trackids = tuple(request_data["trackIds"])
    cur.execute("SELECT tracks.trackid FROM projects natural join projecttracks join tracks on projecttracks.trackid = tracks.trackid WHERE owner = %s and tracks.trackid in %s and projectid = %s",
                (flask_login.current_user.id, trackids, request_data["projectId"],))
    acceptable_trackids = cur.fetchall()
    if len(acceptable_trackids) == 0:
        conn.close()
        cur.close()
        return 'No valid trackids provided', 400

    acceptable_trackids = tuple(
        trackid for subtuple in acceptable_trackids for trackid in subtuple)

    cur.execute("UPDATE projecttracks SET accepted = %s WHERE trackid IN %s",
                (request_data["accepted"], acceptable_trackids,))
    conn.commit()

    conn.close()
    cur.close()
    return 'success'

