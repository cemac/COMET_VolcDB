# ######### FORM CLASSES ##########


class Partners_Form(Form):
    name = StringField(u'*Partner Name',
                       [validators.InputRequired()],
                       render_kw={"placeholder": "e.g. Leeds"})
    country = StringField(u'Country',
                          render_kw={"placeholder": "e.g. UK"})
    role = StringField(u'Role', render_kw={"placeholder":
                                           "e.g. 'Academic' or 'Operational'"})


class Work_Packages_Form(Form):
    code = StringField(u'*Work Package Code',
                       [validators.InputRequired()],
                       render_kw={"placeholder": "e.g. WP-C1"})
    name = StringField(u'*Name',
                       [validators.InputRequired()],
                       render_kw={"placeholder": "e.g. Training"})
    status = StringField(u'*Work Package Status',
                         [validators.InputRequired()],
                         render_kw={"placeholder": "e.g. Overview of Progress as a whole"})
    issues = StringField(u'*Issues',
                         [validators.InputRequired()],
                         render_kw={"placeholder": "e.g. Highlight any potential issues or risks"})
    next_deliverable = StringField(u'*Next Quarter Deliverables',
                                   [validators.InputRequired()],
                                   render_kw={"placeholder": "e.g. Upcomming deliverables due"})


class Deliverables_Form(Form):
    code = StringField(u'*Deliverable Code',
                       [validators.InputRequired()],
                       render_kw={"placeholder": "e.g. D-R1.1"})
    work_package = SelectField(u'*Work Package',
                               [validators.NoneOf(('blank'),
                                                  message='Please select')])
    description = TextAreaField(u'*Description',
                                [validators.InputRequired()],
                                render_kw={"placeholder": "e.g. Report on current state of knowledge regarding user needs for forecasts at different timescales in each sector."})
    partner = SelectField(u'*Partner', [validators.NoneOf(('blank'),
                                                          message='Please select')])
    month_due = IntegerField(u'Month Due',
                             [validators.NumberRange(min=0, max=endMonth,
                                                     message="Must be between 0 and " + str(endMonth))])
    progress = TextAreaField(u'Progress',
                             validators=[validators.Optional()])
    percent = IntegerField(u'*Percentage Complete',
                           [validators.NumberRange(min=0, max=100,
                                                   message="Must be between 0 and 100")])


class Your_Work_Packages_Form(Form):
    code = StringField(u'*Work Package Code')
    name = StringField(u'*Name')
    status = StringField(u'*Work Package Status',
                         [validators.InputRequired()],
                         render_kw={"placeholder": "e.g. Overview of Progress as a whole"})
    issues = StringField(u'*Issues',
                         [validators.InputRequired()],
                         render_kw={"placeholder": "e.g. Highlight any potential issues or risks"})
    next_deliverable = StringField(u'*Next Quarter Deliverables',
                                   [validators.InputRequired()],
                                   render_kw={"placeholder": "e.g. Upcomming deliverables due"})


class Your_Deliverables_Form(Form):
    code = StringField(u'Deliverable Code')
    work_package = StringField(u'Work Package')
    description = TextAreaField(u'Description')
    partner = StringField(u'Partner')
    month_due = IntegerField(u'Month Due')
    progress = TextAreaField(u'Progress',
                             validators=[validators.Optional()])
    percent = IntegerField(u'*Percentage Complete',
                           [validators.NumberRange(min=0, max=100,
                                                   message="Must be between 0 and 100")])


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


class Tasks_Form(Form):
    code = StringField(u'*Task Code',
                       [validators.InputRequired()],
                       render_kw={"placeholder": "e.g. T-R1.1.1"})
    description = TextAreaField(u'*Description',
                                [validators.InputRequired()],
                                render_kw={"placeholder": "e.g. Development of reporting \
template for baselining the current provision of forecasts."})
    partner = SelectField(u'*Partner',
                          [validators.NoneOf(('blank'),
                                             message='Please select')])
    work_package = SelectField(u'*Work Package',
                               [validators.NoneOf(('blank'),
                                                  message='Please select')])
    month_due = IntegerField(u'*Month Due',
                             [validators.NumberRange(min=0, max=endMonth,
                                                     message="Must be between 0 and " + str(endMonth))])
    progress = TextAreaField(u'Progress',
                             validators=[validators.Optional()])
    percent = IntegerField(u'*Percentage Complete',
                           [validators.NumberRange(min=0, max=100,
                                                   message="Must be between 0 and 100")])


class Your_Tasks_Form(Form):
    code = StringField(u'Task Code')
    description = TextAreaField(u'Description')
    partner = StringField(u'Partner')
    work_package = StringField(u'Work Package')
    month_due = IntegerField(u'Month Due')
    progress = TextAreaField(u'Progress',
                             validators=[validators.Optional()])
    percent = IntegerField(u'*Percentage Complete',
                           [validators.NumberRange(min=0, max=100,
                                                   message="Must be between 0 and 100")])
