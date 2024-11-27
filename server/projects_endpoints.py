from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import flask_login
from psycopg2.extras import RealDictCursor
from psycopg2 import sql
from utils import get_db_connection
import math

projects_blueprint = Blueprint('projects', __name__)
RESULTS_PER_PAGE = 12

@projects_blueprint.post("/projects/create")
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

@projects_blueprint.get("/projects/list")
def project_list():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        page = int(request.args.get("page", 1))
    except ValueError:
        page = 1
    offset = (page - 1) * RESULTS_PER_PAGE

    filters = []
    params = [RESULTS_PER_PAGE, offset]
    params = []
    search_query = request.args.get("q")
    if search_query:
        filters.append(sql.SQL("projectname ILIKE %s OR projects.description ILIKE %s OR username ILIKE %s"))
        params.append(f"%{search_query}%")
        params.append(f"%{search_query}%")
        params.append(f"%{search_query}%")
    instruments = request.args.get("instruments")
    if instruments:
        instruments_array = instruments.split(",")
        filters.append(sql.SQL("lookingfor && %s"))
        params.append(instruments_array)
    username = request.args.get("username")
    if username:
        filters.append(sql.SQL("username = %s"))
        params.append(username)

    base_query = sql.SQL("SELECT projectid, username, projectname, lookingfor, lookingforstrict, projects.description FROM projects join users on (projects.owner = users.email) ")


    if filters:
        base_query += sql.SQL(" WHERE ") + sql.SQL(" AND ").join(filters)

    cur.execute(base_query.as_string(conn), params)
    projects = cur.fetchall()

    conn.close()
    cur.close()
    return jsonify(projects)

@projects_blueprint.get("/projects/pagecount")
def project_pagecount():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if 'username' in request.args:
        cur.execute("SELECT COUNT(*) FROM projects JOIN users ON (owner = users.email) WHERE users.username = %s", (request.args.get('username'),))
    else:
        cur.execute("SELECT COUNT(*) FROM projects")
    count = cur.fetchone()

    conn.close()
    cur.close()

    if count:
        total_projects = count['count']
        total_pages = math.ceil(total_projects / RESULTS_PER_PAGE)
        return jsonify(total_pages)
    return jsonify(1)
    

@projects_blueprint.get("/projects/get")
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

