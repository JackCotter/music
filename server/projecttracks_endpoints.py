from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from server.utils import get_db_connection

projecttracks_blueprint = Blueprint('tracks', __name__)

@projecttracks_blueprint.get("/projecttracks/list")
def projecttracks_list():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT title, trackid, createdat FROM tracks natural join projecttracks join users on (tracks.contributeremail = users.email) where username = %s",
                (request.args.get("username"),))
    username = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(username)