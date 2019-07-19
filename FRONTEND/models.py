from COMETApp import db


class Partners(db.Model):
    __tablename__ = 'Countries'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    country = db.Column(db.String())
    role = db.Column(db.String())
    Deformation_observation_Rel = db.relationship('Deformation_observation')
    Volcanoes_Rel = db.relationship('Volcanoes')
    Duration2Countries_Rel = db.relationship('Duration2Countries')

    def __init__(self, name, country, role):
        self.name = name
        self.country = country
        self.role = role

    def __repr__(self):
        return '<name {}>'.format(self.name)


class Regions(db.Model):
    __tablename__ = 'Regions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(), nullable=False, unique=True)
    name = db.Column(db.String(), nullable=False)
    status = db.Column(db.String())
    issues = db.Column(db.String())
    next_deliverable = db.Column(db.String())
    Deformation_observation_Rel = db.relationship('Deformation_observation')
    Volcanoes_Rel = db.relationship('Volcanoes')
    Duration2Regions_Rel = db.relationship('Duration2Regions')

    def __init__(self, code, name, status, issues, next_deliverable):
        self.code = code
        self.name = name
        self.status = status
        self.issues = issues
        self.next_deliverable = next_deliverable

    def __repr__(self):
        return '<id {}>'.format(self.id)


class Deformation_observation(db.Model):
    __tablename__ = 'Deformation_observation'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(), nullable=False, unique=True)
    work_package = db.Column(db.String(), db.ForeignKey('Regions.code'),
                             nullable=False)
    description = db.Column(db.String(), nullable=False)
    partner = db.Column(db.String(), db.ForeignKey('Countries.name'),
                        nullable=False)
    month_due = db.Column(db.Integer, nullable=False)
    progress = db.Column(db.String())
    percent = db.Column(db.Integer, nullable=False)

    def __init__(self, code, work_package, description, partner,
                 month_due, progress, percent):
        self.code = code
        self.work_package = work_package
        self.description = description
        self.partner = partner
        self.month_due = month_due
        self.progress = progress
        self.percent = percent

    def __repr__(self):
        return '<id {}>'.format(self.id)


class Duration(db.Model):
    __tablename__ = 'Duration'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(), unique=True)
    password = db.Column(db.String())
    Duration2Regions_Rel = db.relationship('Duration2Regions')
    Duration2Countries_Rel = db.relationship('Duration2Countries')

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return '<id {}>'.format(self.id)


class Duration2Regions(db.Model):
    __tablename__ = 'Duration2Regions'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(), db.ForeignKey('Duration.username'),
                         nullable=False)
    work_package = db.Column(db.String(), db.ForeignKey('Regions.code'),
                             nullable=False)
    __table_args__ = (db.UniqueConstraint('username', 'work_package',
                                          name='_username_work_package_uc'),)

    def __init__(self, username, work_package):
        self.username = username
        self.work_package = work_package

    def __repr__(self):
        return '<id {}>'.format(self.id)


class Volcanoes(db.Model):
    __tablename__ = 'Volcanoes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.String(), nullable=False)
    partner = db.Column(db.String(), db.ForeignKey('Countries.name'),
                        nullable=False)
    work_package = db.Column(db.String(), db.ForeignKey('Regions.code'),
                             nullable=False)
    month_due = db.Column(db.Integer, nullable=False)
    progress = db.Column(db.String())
    percent = db.Column(db.Integer, nullable=False)

    def __init__(self, code, description, partner, work_package,
                 month_due, progress, percent):
        self.code = code
        self.description = description
        self.partner = partner
        self.work_package = work_package
        self.month_due = month_due
        self.progress = progress
        self.percent = percent

    def __repr__(self):
        return '<id {}>'.format(self.id)


class Duration2Countries(db.Model):
    __tablename__ = 'Duration2Countries'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(), db.ForeignKey('Duration.username'),
                         nullable=False)
    partner = db.Column(db.String(), db.ForeignKey('Countries.name'),
                        nullable=False)
    __table_args__ = (db.UniqueConstraint('username', 'partner',
                                          name='_username_partner_uc'),)

    def __init__(self, username, partner):
        self.username = username
        self.partner = partner

    def __repr__(self):
        return '<id {}>'.format(self.id)
