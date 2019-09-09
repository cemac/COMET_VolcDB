import sqlite3


# Connect to DB
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


# Query DB
def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else (rv if rv else None)


def insertUser(username, password, conn):
    cur = conn.cursor()
    cur.execute("INSERT INTO users (username,password) VALUES (?,?,?)",
                (id, username, password))
    con.commit()
    con.close()


def retrieveUsers(conn):
    cur = con.cursor()
    cur.execute("SELECT id, username, password FROM users")
    users = cur.fetchall()
    con.close()
    return users
