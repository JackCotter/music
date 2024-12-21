from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
from psycopg2.extras import RealDictCursor
import flask_login
import bcrypt
from projects_endpoints import projects_blueprint
from tracks_endpoints import tracks_blueprint
from projecttracks_endpoints import projecttracks_blueprint

from utils import email_in_db, get_db_connection, has_correct_password, username_in_db, verify_recaptcha

app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']
CORS(app, origins=["http://localhost:3000", "https://music-front-267bb60b660a.herokuapp.com/"],  supports_credentials=True, methods=["GET", "POST", "PATCH", "DELETE"])
login_manager = flask_login.LoginManager()
login_manager.init_app(app)
app.register_blueprint(projects_blueprint)
app.register_blueprint(tracks_blueprint)
app.register_blueprint(projecttracks_blueprint)

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

@app.post("/users/create")
def user_create():
    request_data = request.get_json()
    if "password" not in request_data or "username" not in request_data or "email" not in request_data or "recaptchaToken" not in request_data:
        return 'Missing fields', 400
    if not verify_recaptcha(request_data["recaptchaToken"], request.remote_addr):
        return 'Recaptcha Verification Failed', 400
    if email_in_db(request_data["email"]):
        return 'User with that email already exists', 400
    if username_in_db(request_data["username"]):
        return 'Username already in use', 400
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

@app.get("/users/get")
def get_user():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT username, description FROM users where username = %s",
                (request.args.get("username"),))
    username = cur.fetchone()

    cur.close()
    conn.close()
    if username:
        return jsonify(username)
    else:
        return "User not found", 404

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
