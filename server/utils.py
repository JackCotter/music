import os
import bcrypt
import psycopg2

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="music",
        user=os.environ['DB_USERNAME'],
        password=os.environ['DB_PASSWORD'])

def email_in_db(email):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT email FROM users WHERE email = %s", (email,))
    user = cur.fetchone()

    conn.close()
    cur.close()
    return user

def username_in_db(username):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT username FROM users WHERE username = %s", (username,))
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
