def insertUser(username, password, conn):
    cur = conn.cursor()
    cur.execute("INSERT INTO users (username,group,password) VALUES (?,?)",
                (username, password))
    con.commit()
    con.close()


def retrieveUsers(conn):
    cur = con.cursor()
    cur.execute("SELECT username, password FROM users")
    users = cur.fetchall()
    con.close()
    return users
