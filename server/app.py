from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
import psycopg2
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
  if email_in_db(request_data["email"]) and has_correct_password(request_data["email"], request_data["password"]):
    user = User()
    user.id = request_data["email"]
    flask_login.login_user(user)
    return 'logged in!'
  return 'Bad login'

@app.post('/users/logout')
def logout():
  flask_login.logout_user()
  return 'Logged out'

@app.post("/users/create")
@cross_origin()
def user_create():
  request_data = request.get_json()
  if email_in_db(request_data["email"]):
    return 'User already exists'
  password = request_data["password"].encode('utf-8')
  salt = bcrypt.gensalt()
  hashed_password = bcrypt.hashpw(password, salt).decode('utf-8')

  conn = get_db_connection()
  cur = conn.cursor()

  cur.execute("INSERT INTO users (email, username, password) VALUES (%s, %s, %s)", (request_data["email"], request_data["username"], hashed_password))
  conn.commit()

  conn.close()
  cur.close()
  return 'success'

@app.post("/tracks/create")
@flask_login.login_required
def track_create():
  request_data = request.get_json()
  print(request_data["blobData"])
  conn = get_db_connection()
  cur = conn.cursor()

  cur.execute("SELECT projectid FROM projects WHERE projectid = %s", (str(request_data["projectId"])))
  projectid = cur.fetchone()
  if projectid is None:
    return 'project not found'
    
  blob_data_bytes = request_data["blobData"].encode('ascii')
  print("wait")
  print("wait")
  print("wait")
  print(blob_data_bytes)
  # content = base64.b64decode(blob_data_bytes)
  print(blob_data_bytes.decode("ascii"))
  cur.execute("INSERT INTO blob_storage (blob_data) VALUES (%s)", (blob_data_bytes,))
  cur.execute("SELECT blobid FROM blob_storage WHERE blob_data = %s", (blob_data_bytes,))
  blobId = cur.fetchone()

  cur.execute("INSERT INTO tracks (instrumenttype, contributeremail, blobid) VALUES (%s, %s, %s)", (request_data["instrumentType"], flask_login.current_user.id, blobId))
  cur.execute("SELECT trackid FROM tracks WHERE blobid = %s", blobId)
  trackId = cur.fetchone()

  cur.execute("INSERT INTO projecttracks (projectid, trackid, accepted) VALUES (%s, %s, false)", (request_data["projectId"], trackId))

  conn.commit()
  conn.close()
  cur.close()
  return 'success'

@app.post("/project/create")
@flask_login.login_required
@cross_origin()
def project_create():
  request_data = request.get_json()
  conn = get_db_connection()
  cur = conn.cursor()

  cur.execute("INSERT INTO projects (owner, projectname) VALUES (%s, %s)", (flask_login.current_user.id, request_data["projectName"]))
  conn.commit()

  conn.close()
  cur.close()
  return 'success'

@app.get("/tracks/list")
@cross_origin()
def track_list():
  conn = get_db_connection()
  cur = conn.cursor()

  cur.execute("SELECT blob_data, instrumenttype, accepted FROM projects join projecttracks on projects.projectid = projecttracks.projectid join tracks on projecttracks.trackid = tracks.trackid join blob_storage on (tracks.blobid = blob_storage.blobid) where projects.projectid = %s", request.args.get("projectId"))
  tracks = cur.fetchall()

  formatted_tracks = []
  for row in tracks:
    # print("unformatted blob: " + str(row[0]))
    formatted_blob =  row[0].tobytes().decode('ascii')
    # print("formatted blob: " + str(formatted_blob))
    formatted_tracks.append({"blobData": formatted_blob, "instrumentType": row[1], "accepted": row[2]})

  conn.close()
  cur.close()
  return jsonify(formatted_tracks)

@app.get("/projects/list")
@cross_origin()
def project_list():
  conn = get_db_connection()
  cur = conn.cursor()

  if 'ownerUsername' in request.args:
    cur.execute("SELECT projectid, username, projectname, lookingfor, lookingforstrict FROM projects join users on (projects.owner = users.email) WHERE username = %s", (request.args.get("ownerUsername"),))
  else:
    cur.execute("SELECT projectid, username, projectname, lookingfor, lookingforstrict FROM projects join users on (projects.owner = users.email)")
  projects = cur.fetchall()

  conn.close()
  cur.close()
  return str(projects)
