import sqlite3
import pandas as pd
from passlib.hash import sha256_crypt


# Connect to database
DATABASE = 'volcano.db'
conn = sqlite3.connect(DATABASE)
username='failtest'
password_candidate='ijeowgheri'


def insertUser(username, password, conn):
    password = sha256_crypt.encrypt(str(password))
    cur = conn.cursor()
    # Set up to autoincrement id number
    cur.execute("INSERT INTO users (username,password) VALUES (?,?)",
                (username, password))
    conn.commit()


def deleteUser(username, conn):
    cur = conn.cursor()
    # Set up to autoincrement id number
    cur.execute("DELETE FROM users WHERE username is "+
                str(username) + ";")
    conn.commit()


def login(username, password_candidate):
    user = pd.read_sql_query("SELECT * FROM  users WHERE " +
                             "username is '" + str(username) + "';", conn)
    if user is not None and str(username) is not 'admin':
        password = user.password[0]
        # Compare passwords
        if sha256_crypt.verify(password_candidate, password):
            # Passed
            print('You are now logged in', 'success')
            roles = None
            session['logged_in'] = True
            session['username'] = str(username)
            session['usertype'] = str(role)
            if 'admin' in roles[:]:
                session['admin'] = 'True'
                print('You have admin privileges', 'success')
            return print('success')
        else:
            print('Incorrect password', 'danger')
            return print('incorrect password')
    else:
        # Username not found:
        flash('Username not found', 'danger')
        return redirect(url_for('login'))
    if username == 'admin':
        password = 'password'
        if password_candidate == password:
            # Passed
            session['logged_in'] = True
            session['username'] = 'admin'
            session['usertype'] = 'admin'
            print('You are now logged in as admin', 'success')
            return print('success: admin login')
        else:
            flash('Incorrect password', 'danger')
            return redirect(url_for('login'))
    if 'logged_in' in session:
        print('Already logged in', 'warning')
        return print('already logged in')
    return print('not really expecting to see this line')
