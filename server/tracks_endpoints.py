from flask import Blueprint, jsonify, request
import flask_login

from utils import get_db_connection

tracks_blueprint = Blueprint('tracks', __name__)

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
    if request_data["instrumentType"] not in ["bass", "drums", "guitar", "keyboard", "vocals"]:
        return 'invalid instrument type', 400
    if request_data["title"] is None or request_data["description"] is None or request_data["blobData"] is None:
        return 'missing title, description, or blobData', 400
    if not isinstance(request_data["title"], str) or not isinstance(request_data["description"], str) or not isinstance(request_data["blobData"], str):
        return 'title, description, and blobData must be strings', 400
    if len(request_data["title"]) > 30 or len(request_data["description"]) > 100:
        return 'title must be less than 30 characters and description must be less than 100 characters', 400

    blob_data_bytes = request_data["blobData"].encode('ascii')
    cur.execute("INSERT INTO blob_storage (blob_data) VALUES (%s)",
                (blob_data_bytes,))
    cur.execute(
        "SELECT blobid FROM blob_storage WHERE blob_data = %s", (blob_data_bytes,))
    blobId = cur.fetchone()

    cur.execute("INSERT INTO tracks (instrumenttype, contributeremail, blobid, title, description) VALUES (%s, %s, %s, %s, %s)",
                (request_data["instrumentType"], flask_login.current_user.id, blobId, request_data["title"], request_data["description"]))
    cur.execute("SELECT trackid FROM tracks WHERE blobid = %s", blobId)
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

