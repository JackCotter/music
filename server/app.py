from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import flask_login
import bcrypt
import base64


def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="music",
        user=os.environ['DB_USERNAME'],
        password=os.environ['DB_PASSWORD'])


app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']
CORS(app, origins=["http://localhost:3000"],  supports_credentials=True)
login_manager = flask_login.LoginManager()
login_manager.init_app(app)


def email_in_db(email):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT email FROM users WHERE email = %s", (email,))
    user = cur.fetchone()

    conn.close()
    cur.close()
    return user


def has_correct_password(email, password):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT password FROM users WHERE email = %s", (email,))
    correct_password = cur.fetchone()

    conn.close()
    cur.close()
    encoded_password = password.encode('utf-8')
    encoded_correct_password = correct_password[0].encode('utf-8')
    return bcrypt.checkpw(encoded_password, encoded_correct_password)


class User(flask_login.UserMixin):
    pass


@login_manager.user_loader
def user_loader(email):
    if email_in_db(email) is None:
        return

    user = User()
    user.id = email
    return user


@login_manager.request_loader
def request_loader(request):
    email = request.form.get('email')
    if email_in_db(email) is None:
        return

    user = User()
    user.id = email
    return user


@app.post("/users/login")
def user_login():
    request_data = request.get_json()

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT username FROM users where email = %s",
                (request_data["email"],))
    username = cur.fetchone()
    cur.close()
    conn.close()

    print(username)
    print(request_data["email"])

    if username and has_correct_password(request_data["email"], request_data["password"]):
        user = User()
        user.id = request_data["email"]
        flask_login.login_user(user)
        return username[0], 200
    return 'Bad login', 400


@app.post('/users/logout')
def logout():
    flask_login.logout_user()
    return 'Logged out'

@app.post("/users/create")
@cross_origin()
def user_create():
    request_data = request.get_json()
    if "password" not in request_data or "username" not in request_data or "email" not in request_data:
        return 'Missing fields'
    if email_in_db(request_data["email"]):
        return 'User already exists'
    password = request_data["password"].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password, salt).decode('utf-8')

    conn = get_db_connection()
    cur = conn.cursor()

    if "description" not in request_data:
        cur.execute("INSERT INTO users (email, username, password) VALUES (%s, %s, %s)",
                    (request_data["email"], request_data["username"], hashed_password))
    else:
        cur.execute("INSERT INTO users (email, username, password, description) VALUES (%s, %s, %s, %s)",
                    (request_data["email"], request_data["username"], hashed_password, request_data["description"]))
    conn.commit()

    conn.close()
    cur.close()
    return 'success'


@app.post("/tracks/create")
@flask_login.login_required
def track_create():
    request_data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT projectid FROM projects WHERE projectid = %s",
                (str(request_data["projectId"])))
    projectid = cur.fetchone()
    if projectid is None:
        return 'project not found'

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


@app.post("/projects/create")
@flask_login.login_required
def project_create():
    request_data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT projectid FROM projects WHERE owner = %s and projectname = %s",
                (flask_login.current_user.id, request_data["projectName"],))
    project_exists_with_name = cur.fetchone()
    if project_exists_with_name:
        return 'project already exists with that name', 400

    cur.execute("INSERT INTO projects (owner, projectname, lookingfor, lookingforstrict, description) VALUES (%s, %s, %s, %s, %s)",
                (flask_login.current_user.id, request_data["projectName"], request_data["instrumentTypes"], request_data["strictMode"], request_data["description"]),)

    cur.execute("select projectid from projects where owner = %s and projectname = %s",
                (flask_login.current_user.id, request_data["projectName"],))
    projectid = cur.fetchone()
    if projectid is None:
        return 'project could not be created', 400

    conn.commit()
    conn.close()
    cur.close()
    return {"projectId": projectid[0]}


@app.get("/tracks/list")
@cross_origin()
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


@app.patch("/tracks/patch")
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


@app.get("/projects/list")
@cross_origin()
def project_list():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if 'username' in request.args:
        cur.execute("SELECT DISTINCT projects.projectid, username, projectname, lookingfor, lookingforstrict, projects.description FROM tracks join projecttracks on tracks.trackid = projecttracks.trackid join projects on projecttracks.projectid = projects.projectid join users on (tracks.contributeremail = users.email) where username = %s",
                    (request.args.get("username"),))
    else:
        cur.execute("SELECT projectid, username, projectname, lookingfor, lookingforstrict, projects.description FROM projects join users on (projects.owner = users.email)")
    projects = cur.fetchall()

    conn.close()
    cur.close()
    return jsonify(projects)


@app.get("/projects/get")
def project_get():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT projectid, username, projectname, lookingfor, lookingforstrict, projects.description FROM projects join users on (projects.owner = users.email) where projectid = %s", (request.args.get("projectId"),))
    projects = cur.fetchone()
    if projects is None:
        conn.close()
        cur.close()
        return 'project not found', 400

    formatted_project = {"projectid": projects["projectid"], "username": projects["username"], "projectname": projects["projectname"],
                         "lookingfor": projects["lookingfor"], "lookingforstrict": projects["lookingforstrict"], "description": projects["description"], "isowner": False},
    if not flask_login.current_user.is_authenticated:
        conn.close()
        cur.close()
        return jsonify(formatted_project[0])

    cur.execute("SELECT * FROM projects where owner = %s and projectid = %s",
                (flask_login.current_user.id, request.args.get("projectId"), ))
    isOwner = cur.fetchone()

    if isOwner is not None:
        formatted_project = {"projectid": projects["projectid"], "username": projects["username"], "projectname": projects["projectname"],
                             "lookingfor": projects["lookingfor"], "lookingforstrict": projects["lookingforstrict"], "description": projects["description"], "isowner": True},
        conn.close()
        cur.close()
        return jsonify(formatted_project[0])
    else:
        conn.close()
        cur.close()
        return jsonify(formatted_project[0])


@app.get("/users/loggedIn")
@flask_login.login_required
def get_user_logged_in():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT username FROM users where email = %s",
                (flask_login.current_user.id,))
    username = cur.fetchone()

    if username is None:
        conn.close()
        cur.close()
        return 'user not found', 400

    cur.close()
    conn.close()
    return username[0]


@app.get("/users/get")
def get_user():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT username, description FROM users where username = %s",
                (request.args.get("username"),))
    username = cur.fetchone()

    cur.close()
    conn.close()
    return jsonify(username)


@app.get("/projecttracks/list")
def projecttracks_list():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT title, trackid, createdat FROM tracks natural join projecttracks join users on (tracks.contributeremail = users.email) where username = %s",
                (request.args.get("username"),))
    username = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(username)


@app.patch("/users/patch")
@flask_login.login_required
def patch_user():
    request_data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("UPDATE users SET description = %s WHERE email = %s",
                (request_data["description"], flask_login.current_user.id,))
    conn.commit()

    cur.close()
    conn.close()
    return 'success'
