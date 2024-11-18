import os
import bcrypt
import psycopg2
import requests

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'))

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

def verify_recaptcha(token, remote_addr):
    recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify'
    recaptcha_secret_key = os.environ['RECAPTCHA_SECRET_KEY']
    payload = {
        'secret': recaptcha_secret_key,
        'response': token,
        'remoteip': remote_addr,
    }
    response = requests.post(recaptcha_url, data = payload)
    result = response.json()
    return result.get('success', False)
