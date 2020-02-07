"""
volcanoes.py

Module for editing volcanoes

* Edit form
* Edit database
* Moderate? Log update?
* Map Volcanoes?

"""
from wtforms import Form, validators, StringField, SelectField, TextAreaField
from wtforms import DecimalField



class Volcano_edit_Form(Form):
    """Editing an existing volcano
    """
    # Volcano no auto generated
    ID = StringField(u'Volcano number')
    # List existing regions and countries to avoid spelling mistakes etc
    Area = StringField(u'Region')
    country = StringField(u'Country')
    # # yes or no questions
    geodetic_measurements = SelectField(u'Geodetic measurements?',
                                        [validators.Optional()])
    deformation_observation = SelectField(u'Deformation Observation?',
                                          [validators.Optional()])
    measurement_methods = StringField(u'Measurement method(s)',
                                      [validators.Optional()],
                                      render_kw={"placeholder": "e.g. InSAR"})
    duration_of_observation = StringField(u'Duration of observations',
                                          [validators.Optional()],
                                          render_kw={"placeholder": "e.g. 2005-2010"})
    inferred_causes = TextAreaField(u'Inferred cause of deformation',
                                    [validators.Optional()],
                                    render_kw={"placeholder": "e.g. magmatic"})
    characteristics_of_deformation = TextAreaField(u'Characteristics of deformation',
                                                   [validators.Optional()],
                                                   render_kw={"placeholder": "description of deformation"})
    references = TextAreaField(u'References', [validators.Optional()],
                               render_kw={"placeholder": "list of references"})
    latitude = DecimalField(u'latitude', places=3)
    longitude = DecimalField(u'longitude', places=3)


class Volcano_Form(Form):
    """Adding a new volcano
    """
    # Volcano no auto generated
    # List existing regions and countries to avoid spelling mistakes etc
    name = StringField(u'Volcano Name',
                       render_kw={"placeholder": "Volcano name"})
    country = SelectField(u'*Country',
                          [validators.Optional()])
    new_country = StringField(u'If other please specify', [validators.Optional()],
                              render_kw={"placeholder": "country not in dropdown"})
    Area = SelectField(u'*Region (suggested in country selection)',
                       [validators.Optional()])
    new_region = StringField(u'If other please specify', [validators.Optional()],
                             render_kw={"placeholder": "region not in dropdown"})
    # yes or no questions
    geodetic_measurements = SelectField(u'Geodetic measurements?',
                                        [validators.Optional()])
    deformation_observation = SelectField(u'Deformation Observation?',
                                          [validators.Optional()])
    measurement_methods = StringField(u'Measurement method(s)',
                                      [validators.Optional()],
                                      render_kw={"placeholder": "e.g. InSAR"})
    inferred_causes = TextAreaField(u'Inferred cause of deformation',
                                    [validators.Optional()],
                                    render_kw={"placeholder": "e.g. magmatic"})
    characteristics_of_deformation = TextAreaField(u'Characteristics of deformation',
                                                   [validators.Optional()],
                                                   render_kw={"placeholder": "description of deformation"})
    references = TextAreaField(u'References', [validators.Optional()],
                               render_kw={"placeholder": "list of references"})
    latitude = DecimalField(
        u'*latitude', places=3, render_kw={"placeholder": "degrees North (between -90.000 and 90.000)"})
    longitude = DecimalField(u'*longitude', places=3, render_kw={
                             "placeholder": "degrees East (between -180.000 and 180.000)"})
