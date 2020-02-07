import os


class Config(object):
    DEBUG = True
    TESTING = True
    CSRF_ENABLED = True
    SECRET_KEY = os.environ['SECRET_KEY']
    ADMIN_PWD =  os.environ['ADMIN_PWD']
    # SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    # EMAIL SETTINGS
    MAIL_SERVER = 'smtp.gmail.com',
    MAIL_PORT = 465,
    MAIL_USE_SSL = True,
    MAIL_USERNAME = os.environ['mailusername'],
    MAIL_PASSWORD = os.environ['mailpassword']


class ProductionConfig(Config):
    DEBUG = False


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
