from models import Partners, Work_Packages, Deliverables, Users
from models import Users2Work_Packages, Tasks, Users2Partners
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


app = Flask(__name__)


# Index
@app.route('/', methods=["GET"])
def index():
    return render_template('home.html.j2')


# static information pages
@app.route('/about', methods=["GET"])
def about():
    return render_template('about.html.j2')


@app.route('/contact', methods=["GET"])
def contact():
    return render_template('contact.html.j2')


@app.route('/contribute', methods=["GET"])
def contribute():
    return render_template('contributor-guidelines.html.j2')


@app.route('/deformation-causes', methods=["GET"])
def deformation():
    return render_template('deformation-causes.html.j2')


@app.route('/copyright', methods=["GET"])
def copyright():
    return render_template('copyright.html.j2')


@app.route('/measuring-deformation', methods=["GET"])
def measure():
    return render_template('measuring-deformation.html.j2')


@app.route('/glossary', methods=["GET"])
def glossary():
    return render_template('glossary.html.j2')


@app.route('/volcano-index', methods=["GET"])
def volcanodb():
    return render_template('view.html.j2')


@app.route('/volcano-index/volcano', methods=["GET"])
def volcano():
    return render_template('volcano.html.j2')


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
    app.run()
