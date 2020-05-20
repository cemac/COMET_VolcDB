'''
COMETApp.py:

This module was developed by CEMAC ...................
Example:
    To use::
        python manage.py

Attributes:
    endMonth(int): Project length in months

.. CEMAC_COMETApp:
   https://github.com/cemac/COMET_VolcDB
'''
from flask import Flask, render_template, flash, redirect, url_for, request
from flask import g, session, abort, make_response
import sqlite3
import pandas as pd
import os
import sys
import io
import json
from passlib.hash import sha256_crypt
# Modules for this site
from access import *
from comet_db_functions import *
from volcanoes import *
from interactivemap import *
from flask_mail import Mail, Message
app = Flask(__name__)
# app config must be edited here to correctly use mail
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=465,
    MAIL_USE_SSL=True,
    MAIL_USERNAME=os.environ['mailusername'],
    MAIL_PASSWORD=os.environ['mailpassword'])
mail = Mail(app)
# Connect to database
DATABASE = 'volcano.db'
# Separate user database to keep user info Separate
USERDATABASE = 'users.db'
assert os.path.exists(DATABASE), "Unable to locate database"
app.secret_key = 'secret'
conn = sqlite3.connect(DATABASE, check_same_thread=False)
connuser = sqlite3.connect(USERDATABASE, check_same_thread=False)
counter = 1


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        conn.close()


# Index ----------------------------------------------------------------------

@app.route('/', methods=["GET"])
def index():
    df = pd.read_sql_query("SELECT * FROM VolcDB1;", conn)
    df = df[df.Area != 'none']
    df['name'] = df['ID'].where(df['name'] == 'Unnamed', df['name'].values)
    volcinfo = df[['name', 'latitude', 'longitude', 'Area', 'country']]
    volcinfo = volcinfo[volcinfo['latitude'].notna()]
    return render_template('home.html.j2',
                           volcinfo=json.dumps(volcinfo.values.tolist()))


@app.route("/")
def hitcounter():
    global counter
    counter += 1
    return str(counter)


# Volcano Database -----------------------------------------------------------

@app.route('/volcano-index', methods=["GET"])
def volcanodb():
    df = pd.read_sql_query("SELECT AREA FROM VolcDB1;", conn)
    # Count values and remove weird '0' rows
    df2 = df.apply(pd.value_counts)
    df2 = df2.drop(index='none')
    df2['Area_name'] = df2.index.values
    df2 = df2.reset_index(drop=True)
    df2.columns = ['freq', 'Area']
    df2.Area.fillna(value='Unknown', inplace=True)
    total = df2.freq.sum()
    return render_template('volcano-index.html.j2', tableClass='index',
                           data=df2, total=total)


@app.route('/volcano-index/<string:region>', methods=["GET", "POST"])
def volcanodb_region(region):
    # select country
    df = pd.read_sql_query("SELECT country FROM VolcDB1 WHERE AREA = '"
                           + region + "';", conn)
    # Count values and remove weird '0' rows
    df2 = df.apply(pd.value_counts)
    df2['contry_name'] = df2.index.values
    df2 = df2.reset_index(drop=True)
    df2.columns = ['freq', 'country']
    total = df2.freq.sum()
    return render_template('volcano-index.html.j2', data=df2,
                           total=total, region=region, tableClass='region')


@app.route('/volcano-index/<string:region>-all', methods=["GET"])
def volcanodb_region_all(region):
    # select country
    df = pd.read_sql_query("SELECT ID, AREA, country, name, geodetic_measurement" +
                           "s, deformation_observation FROM VolcDB1 WHERE " +
                           "AREA = '" + str(region) + "';", conn)
    total = len(df.index)
    return render_template('volcano-index_all.html.j2', data=df, total=total,
                           region=region, tableclass='region')


@app.route('/volcano-index/<string:region>/<path:country>', methods=["GET"])
def volcanodb_country(country, region):
    # select country
    df = pd.read_sql_query("SELECT ID, AREA, country, name, geodetic_measurement" +
                           "s, deformation_observation FROM VolcDB1 WHERE " +
                           "country = '" + str(country.replace('_', '/')) +
                           "';", conn)
    total = len(df.index)
    country.replace('/', '_')
    return render_template('volcano-index_all.html.j2', data=df, total=total,
                           country=country, region=region,
                           tableclass='country')


@app.route('/volcano-index/Search-All', methods=["GET"])
def volcanodb_all():
    df = pd.read_sql_query("SELECT ID, AREA, country, name, geodetic_measurement" +
                           "s, deformation_observation FROM VolcDB1;", conn)
    df = df[df.Area != 'none']
    df.Area.fillna(value='Unknown', inplace=True)
    df.country.fillna(value='Unknown', inplace=True)
    total = len(df.index)
    return render_template('volcano-index_all.html.j2', data=df, total=total,
                           tableclass='all')


@app.route('/volcano-index/<string:region>/<path:country>/<string:volcano>',
           methods=["GET", "POST"])
def volcano(country, region, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    if len(df.index) == 0:
        df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                               "ID = '" + str(volcano) + "';", conn)
    # fill in missing region and country
    df.fillna(value='Unknown', inplace=True)
    # If there is a pending update
    pending = df['Review needed'].values
    editor = False
    if pending == 'Y':
        dfeds = pd.read_sql_query("SELECT * FROM VolcDB1_edits WHERE " +
                                  "name = '" + str(volcano) + "';", conn)
        if dfeds.owner_id.values[0] == session['username']:
            editor = True
    else:
        dfeds = None
    return render_template('volcano.html.j2', data=df, country=country,
                           region=region, id=id, pending=pending,
                           editor=editor, edits=dfeds)


@app.route('/volcano-index/<string:region>/<path:country>/<string:volcano>/S1_analysis',
           methods=["GET"])
def volcano_analysis(country, region, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    if len(df.index) == 0:
        df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                               "ID = '" + str(volcano) + "';", conn)
    volcano_name = df.jasmin_name.values[0]
    frame = df.frames[0]
    if frame == '':
        frame = 'none'
    return render_template('cemac_analysis_pages.html.j2', data=df,
                           country=country, region=region,
                           frame=frame, volcano=volcano_name)


@app.route('/volcano-index/<string:region>/<path:country>/<string:volcano>/download',
           methods=["GET", "POST"])
def export_as_csv(region, country, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    if len(df.index) == 0:
        df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                               "ID = '" + str(volcano) + "';", conn)
    out = io.StringIO()
    volcano_name = str(volcano).replace(" ", "_").lower()
    df.to_csv(out)
    output = make_response(out.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=volcano.csv"
    output.headers["Content-type"] = "text/csv"
    return output


@app.route('/volcano-index/<string:region>/<path:country>/<string:volcano>/edit',
           methods=["GET", "POST"])
@is_logged_in_as_editor
def volcano_edit(country, region, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    if len(df.index) == 0:
        df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                               "ID = '" + str(volcano) + "';", conn)
    pending = df['Review needed'].values[0]
    if pending == 'Y':
        df = pd.read_sql_query("SELECT * FROM VolcDB1_edits WHERE " +
                               "name = '" + str(volcano) + "';", conn)
        if len(df.index) == 0:
            df = pd.read_sql_query("SELECT * FROM VolcDB1_edits WHERE " +
                                   "ID = '" + str(volcano) + "';", conn)
    form = eval("Volcano_edit_Form")(request.form)
    form.geodetic_measurements.choices = yesno_list()
    form.deformation_observation.choices = yesno_list()
    if request.method == 'POST' and form.validate():
        # Get each form field and update DB:
        now = dt.datetime.now().strftime("%Y-%m-%d")
        df['date_edited'] = str(now)
        df['owner_id'] = session['username']
        addrowedits('VolcDB1_edits', df, conn)
        for field in form:
            editrow('VolcDB1_edits', df.ID[0],
                    field.name, str(field.data), conn)
        # Save to edit database
        editrow('VolcDB1', df.ID[0], 'Review needed', 'Y', conn)
        try:
            msg = Message(str(session['username']) + ' edited ' + str(volcano) + ' [ REVIEW REQUIRED ]',
                          sender=os.environ['mailusername'],
                          recipients=[os.environ['mailusername']])
            msg.body = 'Changes need approval'
            mail.send(msg)
        except Exception as e:
            sys.stderr.write(str(e))
        # Return with success:
        flash('Success! Edits awaiting approval', 'success')
        return redirect(url_for('volcano', country=country, region=region,
                                volcano=volcano))
    # Set title:
    title = "Edit Volcano"
    # Pre-populate form fields with existing data:
    noedit = ['ID', 'Area', 'country']
    if session['usertype'] == 'Admins':
        noedit = ['ID']
    yesnocheck = ['geodetic_measurements', 'deformation_observation']
    for field in form:
        if not request.method == 'POST':
            if field.name in noedit:
                field.render_kw = {'readonly': 'readonly'}
            if field.name in yesnocheck:
                if exec("df." + field.name + "[0]" + "!= 'yes'"):
                    exec("df." + field.name + "[0] = 'no'")
            exec("field.data = df." + field.name + "[0]")
    return render_template('edit.html.j2', data=df, title=title, form=form,
                           country=country, region=region, volcano=volcano)


@app.route('/add/Volcano',  methods=["GET", "POST"])
@is_logged_in_as_editor
def volcano_add():
    # get headers
    df = pd.read_sql_query("select * from  'VolcDB1' limit 0  ", conn)
    form = eval("Volcano_Form")(request.form)
    form.geodetic_measurements.choices = yesno_list()
    form.deformation_observation.choices = yesno_list()
    form.Area.choices = option_list('Area', conn)
    form.country.choices = option_list('country', conn)
    if request.method == 'POST' and form.validate():
        # Create a new line in VolcDB1 and VolcDB1_edits to get new id no
        now = dt.datetime.now().strftime("%Y-%m-%d")
        df.date_edited = str(now)
        df.owner_id = str(session['username'])
        df['Review needed'] = 'Y'
        df['ID'] = pd.read_sql_query("select max(id) from VolcDB1;", conn) + 1
        # check ID no Already  exists
        idmaxeds = pd.read_sql_query("select max(id) from VolcDB1_edits;",
                                     conn)
        # if the edit databas is empty
        try:
            if df['ID'].values[0] <= idmaxeds.values[0]:
                df.ID = idmaxeds + 1
        except TypeError:
            pass
        # dummy variables to allow row creation in DATABASE
        df.country = 'not null'
        df.latitude = 51
        df.longitude = 0
        df.name = 'not null'
        df.Area = 'not null'
        df.owner_id = str(session['username'])
        addrowedits('VolcDB1_edits', df, conn)
        # Get each form field and update DB:
        for field in form:
            if field.name == 'new_country':
                if str(field.data) != '':
                    field.name = 'country'
                    editrow('VolcDB1_edits', df.ID[0], field.name,
                            str(field.data), conn)
                else:
                    continue
            if field.name == 'new_region':
                if str(field.data) != '':
                    field.name = 'Area'
                    editrow('VolcDB1_edits', df.ID[0], field.name,
                            str(field.data), conn)
                else:
                    continue
            editrow('VolcDB1_edits', df.ID[0], field.name, str(field.data),
                    conn)
        # email reviewers
        try:
            msg = Message(str(session['username']) + ' added new volcano [ REVIEW REQUIRED ]',
                          sender=os.environ['mailusername'],
                          recipients=[os.environ['mailusername']])
            msg.body = 'Changes awaiting approval'
            mail.send(msg)
        except Exception as e:
            sys.stderr.write(str(e))
        # Return with success:
        flash('Successfully added, awaiting review', 'success')
    # Set title:
    title = "Add New Volcano"
    noedit = ['ID']
    for field in form:
        if not request.method == 'POST':
            if field.name in noedit:
                field.render_kw = {'readonly': 'readonly'}
    return render_template('add.html.j2', title=title, form=form,
                           tableClass='Volcano')


@app.route('/volcano-index/volcanointerferograms', methods=["GET"])
def volcanointerferograms():
    return render_template('volcanointerferograms.html.j2')


@app.route('/volcano-index/volcanodetail', methods=["GET"])
def volcanodetails():
    return render_template('volcanodetail.html.j2')


@app.route('/review', methods=["GET"])
@is_logged_in_as_reviewer
def volcanodb_reviewlist():
    df = pd.read_sql_query("SELECT * FROM VolcDB1_edits ;", conn)
    df = df[df.Area != 'none']
    total = len(df.index)
    return render_template('moderation.html.j2', data=df, total=total,
                           tableclass='all')


@app.route('/review_volcano/<string:volcano>', methods=["GET"])
@is_logged_in_as_reviewer
def volcano_review(volcano):
    df_edits = pd.read_sql_query("SELECT * FROM VolcDB1_edits WHERE " +
                                 "ID = '" + str(volcano) + "';", conn)
    df_old = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                               "ID = '" + str(volcano) + "';", conn)
    newvolc = 'False'
    if df_old.empty:
        df_old = df_edits
        newvolc = 'True'
    df_diffs = df_old.copy()
    for (columnName, columnData) in df_old.iteritems():
        new = df_edits[str(columnName)].values
        old = df_old[str(columnName)].values
        if new == old:
            df_diffs[str(columnName)] = 'old'
        else:
            df_diffs[str(columnName)] = 'new'
    return render_template('volcano_review.html.j2', data=df_edits,
                           data_old=df_old, data_diff=df_diffs,
                           tableClass='volcanoreview', newvolc=newvolc)


@app.route('/delete/<string:tableClass>/<string:id>', methods=['POST'])
@is_logged_in_as_reviewer
def delete_entry(tableClass, id):
    if tableClass == 'volcanoreview':
        DeleteVolcEdit(id, conn)
        flash('Deleted suggested modification', 'success')
        return redirect(url_for('volcanodb_reviewlist', tableClass=tableClass))
    else:
        flash('not set up for this yet', 'danger')
    return redirect(url_for('volcanodb_reviewlist', tableClass=tableClass))


@app.route('/delete/VolcDB1/<string:id>', methods=['POST'])
@is_logged_in_as_admin
def delete_volcano(id):
        DeleteVolc(id, conn)
        flash('Deleted Volcano database entry!', 'danger')
        return redirect(url_for('volcanodb_all'))


@app.route('/accept/<string:tableClass>/<string:id>', methods=['POST'])
@is_logged_in_as_reviewer
def accept_entry(tableClass, id):
    if tableClass == 'volcanoreview':
        AcceptVolcEdit(id, conn)
        flash('Approved suggested modification', 'success')
        return redirect(url_for('volcanodb_reviewlist', tableClass=tableClass))
    else:
        flash('not set up for this yet', 'danger')
    return redirect(url_for('volcanodb_reviewlist', tableClass=tableClass))


# Access ----------------------------------------------------------------------
# Login
@app.route('/login', methods=["GET", "POST"])
def login():
    if 'logged_in' in session:
        flash('Already logged in', 'warning')
        return redirect(url_for('index'))
    if request.method == 'POST':
        # Get form fields
        username = request.form['username']
        password_candidate = request.form['password']
        user_login(username, password_candidate, connuser)
        return redirect(url_for('index'))
    if request.method == 'GET':
        return render_template('login.html.j2')


# Logout
@app.route('/logout')
@is_logged_in
def logout():
    session.clear()
    flash('You are now logged out', 'success')
    return redirect(url_for('index'))


# Change password
@app.route('/change-pwd', methods=["GET", "POST"])
@is_logged_in
def change_pwd():
    username = session['username']
    form = ChangePwdForm(request.form)
    if request.method == 'POST' and form.validate():
        user = pd.read_sql_query("SELECT * FROM users where username is '"
                                 + username + "' ;", connuser)
        password = user.password[0]
        current = form.current.data
        if sha256_crypt.verify(current, password):
            user.password = sha256_crypt.hash(str(form.new.data))
            sql = "UPDATE users SET password = ? WHERE username is ? ;"
            cur = conn.cursor()
            cur.execute(sql, (user.password[0], str(username)))
            conn.commit()
            flash('Password changed', 'success')
            return redirect(url_for('change_pwd'))
        else:
            flash('Current password incorrect', 'danger')
            return redirect(url_for('change_pwd'))
    return render_template('change-pwd.html.j2', form=form)


# Access settings for a given user
@app.route('/account/<string:username>', methods=['GET', 'POST'])
@is_logged_in
def account(username):
    role = session['usertype']
    # display role
    # user name
    # potential to add affiliations and email to give more bespoke access to
    # who can edit which volcanoes. Eg. Prject or Institute
    return render_template('account.html.j2', username=username, Role=role,
                           cometmail=os.environ['mailusername'],
                           cometpassword=os.environ['mailpassword'])

# Additional logged in as Admin only pages ------------------------------


@app.route('/admin/information', methods=['GET', 'POST'])
@is_logged_in_as_admin
def admininfo():
    return render_template('admininfo.html.j2',
                           cometmail=os.environ['mailusername'],
                           cometpassword=os.environ['mailpassword'])


@app.route('/admin/users', methods=['GET', 'POST'])
@is_logged_in_as_admin
def ViewOrAddUsers():
    df = pd.read_sql_query("SELECT * FROM users ;", connuser)
    df['password'] = '********'
    # add roles
    u2r = pd.read_sql_query("SELECT * FROM users_roles ;", connuser)
    roles = pd.read_sql_query("SELECT * FROM roles ;", connuser)
    u2r2 = pd.merge(u2r, roles, on='group_id')
    del u2r2['group_id']
    usersandroles = pd.merge(df, u2r2, on='id', how='outer')
    usersandroles.rename(columns={'name': 'Role'}, inplace=True)
    usersandroles = usersandroles.dropna(subset=['username'])
    colnames = [s.replace("_", " ").title()
                for s in usersandroles.columns.values[1:]]
    return render_template('view.html.j2', title='Users', colnames=colnames,
                           tableClass='Users', editLink="edit",
                           data=usersandroles)


# Add entry
@app.route('/add/Users', methods=["GET", "POST"])
@is_logged_in_as_admin
def add():
    form = eval("Users_Form")(request.form)
    if request.method == 'POST' and form.validate():
        # Get form fields:
        # Check
        if len(str(form.password.data)) < 8:
            return flash('password must be more than 8 characters',
                         'danger')
        form.password.data = sha256_crypt.hash(str(form.password.data))
        formdata = []
        for f, field in enumerate(form):
            formdata.append(field.data)
        InsertUser(formdata[0], formdata[1], connuser)
        flash('User Added', 'success')
        return redirect(url_for('add', tableClass='Users'))
    return render_template('add.html.j2', title='Add Users', tableClass='Users',
                           form=form)


# Delete entry
@app.route('/delete/<string:tableClass>/<string:id>', methods=['POST'])
@is_logged_in_as_admin
def delete(tableClass, id):
    # Retrieve DB entry:
    user = pd.read_sql_query("SELECT * FROM users where id = " + id + " ;",
                             connuser)
    username = user.username
    DeleteUser(username[0], connuser)
    flash('User Deleted', 'success')
    return redirect(url_for('ViewOrAddUsers'))


# Access settings for a given user
@app.route('/access/<string:id>', methods=['GET', 'POST'])
@is_logged_in_as_admin
def access(id):
    form = AccessForm(request.form)
    form.Role.choices = table_list('roles', 'name', connuser)[1:]
    # Retrieve user DB entry:
    user = pd.read_sql_query("SELECT * FROM users where id = " + id + " ;",
                             connuser)
    if user.empty:
        abort(404)
    # Retrieve all current role
    u2r = pd.read_sql_query("SELECT * FROM users_roles WHERE id = " + id +
                            ";", connuser)
    gid = u2r.group_id[0]
    current_role = pd.read_sql_query("SELECT * FROM roles WHERE group_id = "
                                     + str(gid) + ";", connuser)
    # If user submits edit entry form:
    if request.method == 'POST' and form.validate():
        new_role = form.Role.data
        AssignRole(user.username[0], new_role, connuser)
        # Return with success
        flash('Edits successful', 'success')
        return redirect(url_for('ViewOrAddUsers'))
    # Pre-populate form fields with existing data:
    form.username.render_kw = {'readonly': 'readonly'}
    form.username.data = user.username[0]
    form.Role.data = current_role.name[0]
    return render_template('access.html.j2', form=form, id=id)


# static information pages ---------------------------------------------------
@app.route('/about', methods=["GET"])
def about():
    return render_template('about.html.j2')

@app.route('/about-tools', methods=["GET"])
def abouttools():
    return render_template('about-tools.html.j2')

@app.route('/contact', methods=["GET", "POST"])
def contact():
    form = eval("Contact_Form")(request.form)
    form.subject.choices = subject_list()
    if request.method == 'POST' and form.validate():
        formdata = []
        for f, field in enumerate(form):
            formdata.append(field.data)
        try:
            msg = Message(formdata[0] + ' [' + formdata[2] + ']',
                          sender=os.environ['mailusername'],
                          recipients=[formdata[1], os.environ['mailusername']])
            msg.body = formdata[3] + '\n please note forwarding to appropriate emails not yet set up'
            mail.send(msg)
        except Exception as e:
            flash(str(e), 'danger')
        flash('Message sent', 'success')
        return redirect(url_for('contact'))
    return render_template('contact.html.j2', title='Contact Form',
                           form=form)


@app.route('/contribute', methods=["GET"])
def contribute():
    return render_template('contributor_guidelines.html.j2')


@app.route('/deformation-causes', methods=["GET"])
def deformation():
    return render_template('deformation_causes.html.j2')


@app.route('/copyright', methods=["GET"])
def copyright():
    return render_template('copyright.html.j2')


@app.route('/privacy', methods=["GET"])
def privacy():
    return render_template('privacy.html.j2')


@app.route('/measuring-deformation', methods=["GET"])
def measure():
    return render_template('measuring_deformation.html.j2')


@app.route('/glossary', methods=["GET"])
def glossary():
    return render_template('glossary.html.j2')


# Error Pages ----------------------------------------------------------------
@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('404.html.j2'), 404


@app.errorhandler(403)
def page_not_found(e):
    # note that we set the 403 status explicitly
    return render_template('403.html.j2'), 403


@app.errorhandler(500)
def internal_error(error):
    app.logger.error('Server Error: %s', (error))
    return render_template('500.html.j2'), 500


@app.errorhandler(Exception)
def unhandled_exception(e):
    app.logger.error('Unhandled Exception: %s', (e))
    return render_template('500.html.j2'), 500


if __name__ == '__main__':
    app.run(debug=True)
