import sqlite3
import pandas as pd

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
    # Set up to autoincrement id number
    cur.execute("INSERT INTO users (username,password) VALUES (?,?)",
                (username, password))
    conn.commit()
    conn.close()


def retrieveUsers(conn):
    cur = con.cursor()
    cur.execute("SELECT id, username, password FROM users")
    users = cur.fetchall()
    con.close()
    return users


def editrow(table, id, colname, value, conn):
    cur = conn.cursor()
    # Set up to autoincrement id number
    # NB as a column is called key word references it must include '' round
    # col name
    sql = ("UPDATE " + str(table) + " SET '" + str(colname) + "' = ? WHERE"
           + " ID is ? ;")
    cur.execute(sql, (str(value), str(id)))
    conn.commit()


def addrow(table, df, conn):
    """
    table(str)
    datafram(df) = headers match column name
    """
    cur = conn.cursor()
    colname = df.columns.values
    column = ','.join(colname)
    # Set up to autoincrement id number
    # NB as a column is called key word references it must include '' round
    # col name
    sql = ("insert into " + str(table) + ' (' + str(colname)
           + "') VALUES (?);")
    cur.execute(sql, str(df.values))
    conn.commit()


def addrowedits(table, df, conn):
    """
    table(str)
    datafram(df) = headers match column name
    """
    # remove odd Unnamed: 0 column
    colname = df.columns.values
    colname = "','".join(colname)
    id = df.ID.values[0]
    # instert into db
    cur = conn.cursor()
    sql = 'DELETE FROM VolcDB1_edits WHERE ID = '+str(id)+' ;'
    cur.execute(sql)
    conn.commit()
    df.to_sql(table, con=conn, index=False, if_exists='append')


def DeleteVolcEdit(id, conn):
    cur = conn.cursor()
    sql = 'DELETE FROM VolcDB1_edits WHERE id is ? ;'
    cur.execute(sql, (id,))
    conn.commit()
    cur = conn.cursor()
    sql = ("UPDATE VolcDB1 SET 'Review needed' = 'N' WHERE"
           + " id is ? ;")
    cur.execute(sql, (id,))
    conn.commit()


def AcceptVolcEdit(id, conn):
    df_edits = pd.read_sql_query("SELECT * FROM VolcDB1_edits WHERE " +
                                 "ID = '" + str(id) + "';", conn)
    df_edits['Review needed'] = 'N'
    cur = conn.cursor()
    sql = 'DELETE FROM VolcDB1 WHERE id is ? ;'
    cur.execute(sql, (id,))
    conn.commit()
    df_edits.to_sql('VolcDB1', con=conn, index=False, if_exists='append')
    cur = conn.cursor()
    sql = 'DELETE FROM VolcDB1_edits WHERE id is ? ;'
    cur.execute(sql, (id,))
    conn.commit()


def DeleteVolc(id, conn):
    cur = conn.cursor()
    sql = 'DELETE FROM VolcDB1 WHERE id is ? ;'
    cur.execute(sql, (id,))
    conn.commit()
