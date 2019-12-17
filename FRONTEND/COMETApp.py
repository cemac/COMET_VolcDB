'''
COMETApp.py:

This module was developed by CEMAC ...................
Example:
    To use::
        python manage.py

Attributes:
    endMonth(int): Project length in months

.. CEMAC_stomtracking:
   https://github.com/cemac/COMET_VolcDB
'''
from flask import Flask, render_template, flash, redirect, url_for, request
from flask import g, session, abort, make_response
from wtforms import Form, validators, StringField, SelectField, TextAreaField
from wtforms import IntegerField, PasswordField, SelectMultipleField, widgets
import sqlite3
import pandas as pd
import os
import io
from passlib.hash import sha256_crypt
# Modules for this site
from access import *
from comet_db_functions import *
from volcanoes import *


app = Flask(__name__)
# Connect to database
DATABASE = 'volcano.db'
assert os.path.exists(DATABASE), "Unable to locate database"
app.secret_key = 'secret'
conn = sqlite3.connect(DATABASE, check_same_thread=False)
counter = 1


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        conn.close()


# Index
@app.route('/', methods=["GET"])
def index():
    return render_template('home.html.j2')


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
    df2 = df2.drop(index='0')
    df2['Area_name'] = df2.index.values
    df2 = df2.reset_index(drop=True)
    df2.columns = ['freq', 'Area']
    total = df2.freq.sum()
    return render_template('volcano-index.html.j2', data=df2, total=total)


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
    return render_template('volcano-index_bycountry.html.j2', data=df2,
                           total=total, region=region, tableclass='region')


@app.route('/volcano-index/<string:region>-all', methods=["GET"])
def volcanodb_region_all(region):
    # select country
    df = pd.read_sql_query("SELECT AREA, country, name, geodetic_measurement" +
                           "s, deformation_observation FROM VolcDB1 WHERE " +
                           "AREA = '" + str(region) + "';", conn)
    total = len(df.index)
    return render_template('volcano-index_all.html.j2', data=df, total=total,
                           region=region, tableclass='region')


@app.route('/volcano-index/<string:region>/<string:country>', methods=["GET"])
def volcanodb_country(country, region):
    # select country
    df = pd.read_sql_query("SELECT AREA, country, name, geodetic_measurement" +
                           "s, deformation_observation FROM VolcDB1 WHERE " +
                           "country = '" + str(country) + "';", conn)
    total = len(df.index)
    return render_template('volcano-index_all.html.j2', data=df, total=total,
                           country=country, region=region, tableclass='country')


@app.route('/volcano-index/Search-All', methods=["GET"])
def volcanodb_all():
    df = pd.read_sql_query("SELECT AREA, country, name, geodetic_measurement" +
                           "s, deformation_observation FROM VolcDB1;", conn)
    df = df[df.Area != '0']
    total = len(df.index)
    return render_template('volcano-index_all.html.j2', data=df, total=total,
                           tableclass='all')


@app.route('/volcano-index/<string:region>/<string:country>/<string:volcano>',
           methods=["GET", "POST"])
def volcano(country, region, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    return render_template('volcano.html.j2', data=df, country=country, region=region)


@app.route('/volcano-index/<string:region>/<string:country>/<string:volcano>/volcanodetail',
           methods=["GET"])
def volcano_detail(country, region, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    return render_template('volcanodetail.html.j2', data=df, country=country, region=region)


@app.route('/volcano-index/<string:region>/<string:country>/<string:volcano>/volcanointerferograms',
           methods=["GET"])
def volcano_inter(country, region, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    return render_template('volcanointerferograms.html.j2', data=df,
                           country=country, region=region)


@app.route('/volcano-index/<string:region>/<string:country>/<string:volcano>/cemac_analysis_pages',
           methods=["GET"])
def volcano_analysis(country, region, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    volcano_name = str(volcano).replace(" ", "_").lower()
    return render_template('cemac_analysis_pages.html.j2', data=df,
                           country=country, region=region, volcano=volcano_name)


@app.route('/volcano-index/<string:region>/<string:country>/<string:volcano>/download',
           methods=["GET", "POST"])
def export_as_csv(region, country, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    out = io.StringIO()
    volcano_name = str(volcano).replace(" ", "_").lower()
    df.to_csv(out)
    output = make_response(out.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=volcano.csv"
    output.headers["Content-type"] = "text/csv"
    return output


@app.route('/volcano-index/<string:region>/<string:country>/<string:volcano>/edit',
           methods=["GET", "POST"])
@is_logged_in
def volcano_edit(country, region, volcano):
    df = pd.read_sql_query("SELECT * FROM VolcDB1 WHERE " +
                           "name = '" + str(volcano) + "';", conn)
    form = eval("Volcano_edit_Form")(request.form)
    form.geodetic_measurements.choices = yesno_list()
    form.deformation_observation.choices = yesno_list()
    if request.method == 'POST' and form.validate():
        # Get each form field and update DB:
        for field in form:
            editrow('VolcDB1', df.ID[0], field.name, str(field.data), conn)
        # Return with success:
        flash('Edits successful', 'success')
        return redirect(url_for('volcano', country=country, region=region,
                                volcano=volcano))
    # Set title:
    title = "Edit Volcano"
    # Pre-populate form fields with existing data:
    noedit = ['ID', 'Area', 'country']
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


@app.route('/volcano-index/add',
           methods=["GET", "POST"])
@is_logged_in
def volcano_add():
    # get headers
    df = pd.read_sql_query("select * from  'VolcDB1' limit 0  ", conn)
    form = eval("Volcano_Form")(request.form)
    form.geodetic_measurements.choices = yesno_list()
    form.deformation_observation.choices = yesno_list()
    form.Area.choices = option_list('Area', conn)
    form.country.choices = option_list('country', conn)
    if request.method == 'POST' and form.validate():
        # Get each form field and update DB:
        for field in form:
            editrow('VolcDB1', df.ID[0], field.name, str(field.data), conn)
        # Return with success:
        flash('Edits successful', 'success')
        return redirect(url_for('volcano', country=country, region=region,
                                volcano=volcano))
    # Set title:
    title = "Edit Volcano"
    noedit = ['ID']
    for field in form:
        if not request.method == 'POST':
            if field.name in noedit:
                field.render_kw = {'readonly': 'readonly'}
    return render_template('add.html.j2', data=df, title=title, form=form)


@app.route('/volcano-index/volcanointerferograms', methods=["GET"])
def volcanointerferograms():
    return render_template('volcanointerferograms.html.j2')


@app.route('/volcano-index/volcanodetail', methods=["GET"])
def volcanodetails():
    return render_template('volcanodetail.html.j2')


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
        user_login(username, password_candidate, conn)
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
                                 + username + "' ;", conn)
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
    return render_template('account.html.j2', username=username, Role=role)

# Additional logged in as Admin only pages ------------------------------


@app.route('/admin/information', methods=['GET', 'POST'])
@is_logged_in_as_admin
def admininfo():
    return render_template('admininfo.html.j2')


@app.route('/admin/users', methods=['GET', 'POST'])
@is_logged_in_as_admin
def ViewOrAddUsers():
    df = pd.read_sql_query("SELECT * FROM Users ;", conn)
    df['password'] = '********'
    # add roles
    u2r = pd.read_sql_query("SELECT * FROM users_roles ;", conn)
    roles = pd.read_sql_query("SELECT * FROM roles ;", conn)
    u2r2 = pd.merge(u2r, roles, on='group_id')
    del u2r2['group_id']
    usersandroles = pd.merge(df, u2r2, on='id', how='outer')
    usersandroles.rename(columns={'name': 'Role'}, inplace=True)
    usersandroles = usersandroles.dropna(subset=['username'])
    colnames = [s.replace("_", " ").title() for s in usersandroles.columns.values[1:]]
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
        InsertUser(formdata[0], formdata[1], conn)
        flash('User Added', 'success')
        return redirect(url_for('add', tableClass='Users'))
    return render_template('add.html.j2', title='Add Users', tableClass='Users',
                           form=form)


# Delete entry
@app.route('/delete/<string:tableClass>/<string:id>', methods=['POST'])
@is_logged_in_as_admin
def delete(tableClass, id):
    # Retrieve DB entry:
    user = pd.read_sql_query("SELECT * FROM Users where id = " + id + " ;",
                             conn)
    username = user.username
    DeleteUser(username[0], conn)
    flash('User Deleted', 'success')
    return redirect(url_for('ViewOrAddUsers'))


# Access settings for a given user
@app.route('/access/<string:id>', methods=['GET', 'POST'])
@is_logged_in_as_admin
def access(id):
    form = AccessForm(request.form)
    form.Role.choices = table_list('roles', 'name', conn)[1:]
    # Retrieve user DB entry:
    user = pd.read_sql_query("SELECT * FROM Users where id = " + id + " ;",
                             conn)
    if user.empty:
        abort(404)
    # Retrieve all current role
    u2r = pd.read_sql_query("SELECT * FROM users_roles WHERE id = " + id +
                            ";", conn)
    gid = u2r.group_id[0]
    current_role = pd.read_sql_query("SELECT * FROM roles WHERE group_id = "
                                     + str(gid) + ";", conn)
    # If user submits edit entry form:
    if request.method == 'POST' and form.validate():
        new_role = form.Role.data
        AssignRole(user.username[0], new_role, conn)
        print('test')
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


@app.route('/contact', methods=["GET"])
def contact():
    return render_template('contact.html.j2')


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
    app.run(host='129.11.85.32', debug=True, port=5000)
    #app.run(debug=True)
