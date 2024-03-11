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

    cur.execute("SELECT projectid FROM projects WHERE projectid = %s",
                (str(request_data["projectId"]),))
    projectid = cur.fetchone()
    if projectid is None:
        return 'project not found', 400

    cur.execute("SELECT max(blobid) + 1 FROM tracks")
    blobId = cur.fetchone();
    print(blobId[0])
    if blobId[0] is None:
        return 'Error generating blobId', 400

    blob_data_bytes = bytes(request_data["blobData"], 'ascii')
    buffer = io.BytesIO()
    buffer.write(blob_data_bytes)
    buffer.seek(0)
    try:
        response = s3.upload_fileobj(
            buffer, os.environ.get('S3_BUCKET_NAME'), "tracks/" + blobId + ".bin")
    except Exception as e:
        return str(e), 400

    cur.execute("INSERT INTO tracks (instrumenttype, contributeremail, blobid, title, description) VALUES (%s, %s, %s, %s, %s)",
                (request_data["instrumentType"], flask_login.current_user.id, blobId[0], request_data["title"], request_data["description"]))
    cur.execute("SELECT trackid FROM tracks WHERE blobid = %s", blobId[0])
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

    cur.execute("SELECT tracks.trackid, blob_data, instrumenttype, accepted, tracks.title, tracks.description FROM projects join projecttracks on projects.projectid = projecttracks.projectid join tracks on projecttracks.trackid = tracks.trackid join blob_storage on (tracks.blobid = blob_storage.blobid) where projects.projectid = %s", (request.args.get("projectId"),))
    tracks = cur.fetchall()

    formatted_tracks = []
    for row in tracks:
        formatted_blob = row[1].tobytes().decode('ascii')
        formatted_tracks.append(
            {"trackId": row[0], "blobData": formatted_blob, "instrumentType": row[2], "accepted": row[3], "title": row[4], "description": row[5]})

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

