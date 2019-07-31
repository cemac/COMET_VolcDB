"""
Access.py

Module for a login page

"""

from flask import Flask, render_template, flash, redirect, url_for, request
from flask import g, session, abort
from wtforms import Form, validators, StringField, SelectField, TextAreaField
from wtforms import IntegerField, PasswordField, SelectMultipleField, widgets
import datetime as dt
import os
import pandas as pd
from functools import wraps
from passlib.hash import sha256_crypt


class Users_Form(Form):
    username = StringField('Username', [validators.Length(min=4, max=25)])
    password = PasswordField('Password',
                             [validators.Regexp('^([a-zA-Z0-9]{8,})$',
                                                message='Password must be mimimum 8 characters and contain only uppercase letters, \
        lowercase letters and numbers')])


class ChangePwdForm(Form):
    current = PasswordField('Current password', [validators.DataRequired()])
    new = PasswordField('New password',
                        [validators.Regexp('^([a-zA-Z0-9]{8,})$',
                                           message='Password must be mimimum 8 characters and contain only uppercase letters, \
        lowercase letters and numbers')])
    confirm = PasswordField('Confirm new password',
                            [validators.EqualTo('new',
                                                message='Passwords do no match')])


class MultiCheckboxField(SelectMultipleField):
    widget = widgets.ListWidget(prefix_label=False)
    option_widget = widgets.CheckboxInput()


class AccessForm(Form):
    username = StringField('Username')
    AdminReader = MultiCheckboxField(
        'ADMIN or View all Access: (Grant Admin privileges or the ability to view all (read-only)):')
    work_packages = MultiCheckboxField(
        'WORK PACKAGE LEADERS: Can update Work Package progress and view associated Task and Deliverables:')
    partners = MultiCheckboxField(
        'PARTNER LEADER: Can update progress on tasks and deliverables for which they are the responsible partner:')


def is_logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash('Unauthorised, please login', 'danger')
            return redirect(url_for('index'))
    return wrap


# Check if user is logged in as a trainer/admin
def is_logged_in_as_editor(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session and (session['usertype'] == 'editor' or session['usertype'] == 'admin'):
            return f(*args, **kwargs)
        else:
            flash('Unauthorised, please login as a editor/admin', 'danger')
            return redirect(url_for('index'))
    return wrap


# Check if user is logged in as admin
def is_logged_in_as_admin(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session and session['usertype'] == 'admin':
            return f(*args, **kwargs)
        else:
            flash('Unauthorised, please login as admin', 'danger')
            return redirect(url_for('index'))
    return wrap
