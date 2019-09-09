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
from flask import g, session, abort
from access import *
import sqlite3
import pandas as pd
import os
from passlib.hash import sha256_crypt
from comet_db_functions import *


app = Flask(__name__)
# Connect to database
DATABASE = 'volcano.db'
assert os.path.exists(DATABASE), "Unable to locate database"
app.secret_key = 'secret'
conn = sqlite3.connect(DATABASE)
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


@app.route('/volcano-index/<string:region>', methods=["GET"])
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
           methods=["GET"])
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
    return render_template('volcanointerferograms.html.j2', data=df, country=country, region=region)


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
    if request.method == 'POST':
        # Get form fields
        username = request.form['username']
        password_candidate = request.form['password']
        # Check trainee accounts first:
        user = None
        if user is not None:
            password = user.password
            # Compare passwords
            if sha256_crypt.verify(password_candidate, password):
                # Passed
                flash('You are now logged in', 'success')
                roles = None
                if 'admin' in roles[:]:
                    session['admin'] = 'True'
                    flash('You have admin privileges', 'success')
                return redirect(url_for('index'))
            else:
                flash('Incorrect password', 'danger')
                return redirect(url_for('login'))
        # Finally check admin account:
        if username == 'admin':
            password = 'password'
            if password_candidate == password:
                # Passed
                session['logged_in'] = True
                session['username'] = 'admin'
                # session['usertype'] = 'admin'
                flash('You are now logged in as admin', 'success')
                return redirect(url_for('index'))
            else:
                flash('Incorrect password', 'danger')
                return redirect(url_for('login'))
        # Username not found:
        flash('Username not found', 'danger')
        return redirect(url_for('login'))
    if 'logged_in' in session:
        flash('Already logged in', 'warning')
        return redirect(url_for('index'))
    # Not yet logged in:
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
    form = ChangePwdForm(request.form)
    if request.method == 'POST' and form.validate():
        user = Users.query.filter_by(username=session['username']).first()
        password = user.password
        current = form.current.data
        if sha256_crypt.verify(current, password):
            user.password = sha256_crypt.encrypt(str(form.new.data))
            db.session.commit()
            flash('Password changed', 'success')
            return redirect(url_for('change_pwd'))
        else:
            flash('Current password incorrect', 'danger')
            return redirect(url_for('change_pwd'))
    return render_template('change-pwd.html.j2', form=form)

# admin pages ---------------------------------------------------

"""
@app.route('/admin/information', methods=['GET', 'POST'])
@is_logged_in_as_admin
def access(id):
    return render_template('admininfo.html.j2')


@app.route('/admin/users', methods=['GET', 'POST'])
@is_logged_in_as_admin
def access(id):
    return render_template('access.html.j2')

"""
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
    app.run(host='129.11.85.32')
