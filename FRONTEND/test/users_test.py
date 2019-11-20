import sqlite3
import pandas as pd
from passlib.hash import sha256_crypt


# Connect to database
DATABASE = 'volcano.db'
conn = sqlite3.connect(DATABASE)
username = 'failtest'
password_candidate = 'ijeowgheri'
session = pd.DataFrame()

print('******Begin Notice*******')
print('These test are written to work outside of app')
print('All flask components removed, please use flash rather than print etc')
print('Function may need to have template renders out back in')
print('*******End Notice********')


def InsertUser(username, password, conn):
    """InsertUser
    Description:
        Inserts user into database and hashes password
    Args:
        username (str): username e.g jsmith
        password (str): password must be more than 8 characters
    Returns:
        commits user to database as registered user
    """
    # Check
    if len(password) < 8:
        return print('password must be more than 8 characters')
    # Hash password
    password = sha256_crypt.encrypt(str(password))
    # create a cursor
    cur = conn.cursor()
    # Insert user into table
    cur.execute("INSERT INTO users (username,password) VALUES (?,?)",
                (username, password))
    # All new users automatically become a registerd user
    AssignRole(username, 'Registerd_Users', conn)
    conn.commit()


def OptionalInfo(username, conn, affiliation=None,
                 email=None, request=None, consent=None):
    """OptionalInfo
    Description:
        Inserts user into database and hashes password
    Args:
        username (str): username e.g jsmith
        password (str): password must be more than 8 characters
    Kargs:
        affiliation (str): Institute affiliation (optional)
        email (str): optional Email address (required only for Collaborators)
        request collaborator (str): optional 'Y' or 'N'
        consent_regional_map_anon (str): consent to anonomous data added to
                                         regional users map? defaults to None
    Returns:
        commits user to database as registered user
    """
    id = None
    cur.execute("INSERT INTO users (affiliation,email) VALUES (?)",
                (str(affiliation), str(email)))
    conn.commit()


def DeleteUser(username, conn):
    """DeleteUser
    Description:
        Delets user from database
    Args:
        username (str): username e.g jsmith
        conn (db connection): database connection to volcano.db
    Kargs:
        affiliation (str): Institute affiliation (optional)
        email (str): Email address (required only for Collaborators)
        request collaborator (str): 'Y' or 'N', defaults to 'N'
        consent_regional_map_anon (str): consent to anonomous data added to
                                         regional users map? defaults to 'N'
    Returns:
        commits user to database as registered user
    """
    cur = conn.cursor()
    sql = 'DELETE FROM users WHERE username=?'
    cur.execute(sql, (username,))
    conn.commit()


def AssignRole(username, role, conn):
    """AssignRole
    Description:
        Delets user from database
    Args:
        username (str): username e.g jsmith
        role (str): predefined role name
        conn (db connection): database connection to volcano.db
    Kargs:
        affiliation (str): Institute affiliation (optional)
        email (str): Email address (required only for Collaborators)
        request collaborator (str): 'Y' or 'N', defaults to 'N'
        consent_regional_map_anon (str): consent to anonomous data added to
                                         regional users map? defaults to 'N'
    Returns:
        commits user to database as registered user
    """
    if str(role) not in ['Registered_Users', 'Collaborators', 'Admins']:
        return print('Role must be one of: Registerd_Users, Collaborators, Admins')
    cur = conn.cursor()
    sql = "SELECT * FROM  users WHERE username is '"+f"{str(username)}"+"';"
    user = pd.read_sql_query(sql, conn)
    sql = ("SELECT group_id FROM  users_roles WHERE id is '" +
           f"{str(user.id.values[0])}"+"';")
    exist_role = pd.read_sql_query(sql, conn)
    if not exist_role.empty:
        sql = 'DELETE from users_roles where id is ?'
        cur.execute(sql, str(user.id))
    sql = "SELECT * FROM roles WHERE name is '"+f"{str(role)}"+"';"
    role = pd.read_sql_query(sql, conn)
    sql = 'INSERT into users_roles VALUES(?,?)'
    cur.execute(sql, (str(user.id.values[0]), str(role.group_id.values[0])))
    conn.commit()


def login(username, password_candidate, conn):
    if 'logged_in' in session:
        print('Already logged in', 'warning')
        return print('already logged in')
    user = pd.read_sql_query("SELECT * FROM  users WHERE username is '"
                             + str(username) + "';", conn)
    roles = pd.read_sql_query("SELECT * FROM  roles;", conn)
    if user.empty is False and str(username) is not 'admin':
        password = user.password[0]
        # Compare passwords
        if sha256_crypt.verify(password_candidate, password):
            # Passed
            print('You are now logged in', 'success')
            roleid = pd.read_sql_query("SELECT * FROM users_roles WHERE id " +
                                       "is " + str(user.id[0]) + ";", conn)
            role = pd.read_sql_query("SELECT * FROM roles WHERE group_id " +
                                     "is " + str(roleid.group_id[0]) + ";",
                                     conn)
            session['logged_in'] = True
            session['username'] = str(username)
            session['usertype'] = str(role.name[0])
            if str(role) == 'admin':
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
    return print('not really expecting to see this line')
