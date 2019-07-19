
def psql_to_pandas(query):
    df = pd.read_sql(query.statement, db.session.bind)
    return df


def psql_insert(row, flashMsg=True):
    try:
        db.session.add(row)
        db.session.commit()
        if flashMsg:
            flash('Added to database', 'success')
    except IntegrityError:
        db.session.rollback()
        flash('Integrity Error: Violation of unique constraint(s)', 'danger')
    return


def psql_delete(row, flashMsg=True):
    try:
        db.session.delete(row)
        db.session.commit()
        if flashMsg:
            flash('Entry deleted', 'success')
    except IntegrityError:
        db.session.rollback()
        flash('Integrity Error: Cannot delete, other database entries likely' +
              ' reference this one', 'danger')
    return
####################################
# ######### LOGGED-IN FUNCTIONS ##########
# Check if user is logged in
def is_logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash('Unauthorised, please login', 'danger')
            return redirect(url_for('index'))
    return wrap

# Check if user is logged in as admin


def is_logged_in_as_admin(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session and session['username'] == 'admin':
            return f(*args, **kwargs)
        elif 'logged_in' in session and session['admin'] == 'True':
            return f(*args, **kwargs)
        else:
            flash('Unauthorised, please login as admin', 'danger')
            return redirect(url_for('index'))
    return wrap
#########################################

# ######### MISC FUNCTIONS ##########


def table_list(tableClass, col):
    DF = psql_to_pandas(eval(tableClass).query.order_by(eval(tableClass).id))
    list = [('blank', '--Please select--')]
    for element in DF[col]:
        list.append((element, element))
    return list
#########################################
