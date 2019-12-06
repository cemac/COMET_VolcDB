"""
volcanoes.py

Module for editing volcanoes

* Edit form
* Edit database
* Moderate? Log update?
* Map Volcanoes?

"""

from flask import Flask, render_template, flash, redirect, url_for, request
from flask import g, session, abort
from wtforms import Form, validators, StringField, SelectField, TextAreaField
from wtforms import IntegerField, PasswordField, SelectMultipleField, widgets
from wtforms import DecimalField
import datetime as dt
import os
import pandas as pd
from functools import wraps
from passlib.hash import sha256_crypt


class Volcano_edit_Form(Form):
    """Editing an existing volcano
    """
    # Volcano no auto generated
    ID = StringField(u'Volcano number')
    # List existing regions and countries to avoid spelling mistakes etc
    Area = StringField(u'Region')
    country = StringField(u'Country')
    # # yes or no questions
    geodetic_measurements = SelectField(u'*Geodetic measurements?',
                                        [validators.NoneOf(('blank'),
                                        message='Please select')])
    deformation_observation = SelectField(u'*Deformation Observation',
                                          [validators.NoneOf(('blank'),
                                           message='Please select')])
    measurement_methods = StringField(u'Measurement method(s)',
                                      [validators.Optional()],
                                      render_kw={"placeholder": "e.g. InSAR"})
    duration_of_observation = StringField(u'Duration of observation',
                                          [validators.Optional()],
                                          render_kw={"placeholder": "e.g. 2005-2010"})
    inferred_causes = StringField(u'Inferred cause of deformation',
                                  [validators.Optional()],
                                  render_kw={"placeholder": "e.g. magmatic"})
    characteristics_of_deformation = StringField(u'Characteristics of deformation',
                                                 [validators.Optional()],
                                                 render_kw={"placeholder": "description of deformation"})
    references = StringField(u'References', [validators.Optional()],
                             render_kw={"placeholder": "list of references"})
    latitude = DecimalField(u'latitdue', places=3)
    longitude = DecimalField(u'longitude', places=3)


class Volacano_Form(Form):
    """Adding a new volcano
    """
    # Volcano no auto generated
    ID = StringField(u'Volcano number')
    # List existing regions and countries to avoid spelling mistakes etc
    Area = SelectField(u'*Region',
                       [validators.NoneOf(('blank'),
                       message='Please select')])
    new_region = StringField(u'If other please specify', [validators.Optional()],
                             render_kw={"placeholder": "region not in dropdown"})
    country = SelectField(u'*Country',
                          [validators.NoneOf(('blank'),
                           message='Please select')])
    new_country = StringField(u'If other please specify', [validators.Optional()],
                              render_kw={"placeholder": "country not in dropdown"})
    # yes or no questions
    geodetic_measurements = SelectField(u'*Geodetic measurements?',
                                        [validators.NoneOf(('blank'),
                                         message='Please select')])
    deformation_observation = SelectField(u'*Deformation Observation?',
                                          [validators.NoneOf(('blank'),
                                           message='Please select')])
    measurement_method = StringField(u'Measurement method(s)',
                                     [validators.Optional()],
                                     render_kw={"placeholder": "e.g. InSAR"})
    duration = StringField(u'Duration of observation',
                           [validators.Optional()],
                           render_kw={"placeholder": "e.g. 2005-2010"})
    causes = StringField(u'Inferred cause of deformation',
                         [validators.Optional()],
                         render_kw={"placeholder": "e.g. magmatic"})
    characteristics = StringField(u'Characteristics of deformation',
                                  [validators.Optional()],
                                  render_kw={"placeholder": "description of deformation"})
    references = StringField(u'References', [validators.Optional()],
                             render_kw={"placeholder": "list of references"})
    location = StringField(u'Location', [validators.Optional()],
                             render_kw={"placeholder": "list of references"})
