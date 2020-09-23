# -*- coding: utf-8 -*-
"""create db
.. module:: create db
    :platform: Unix
    :synopis: create sqlite database from csv file
.. moduleauthor: Helen Burns (CEMAC-UoL)
.. description: This module was developed by CEMAC as part of COMET (Nerc)
   :copyright: © 2019 University of Leeds.
   :license: MIT
Example:
    To use::
Memebers:
.. CEMAC_VolcDB:
   https://github.com/cemac/COMET_VolcDB
"""

import pandas as pd
import sqlite3
import random
from sqlalchemy import create_engine

# connect to volcano.db
conn = sqlite3.connect('volcano.db')
volcll = pd.read_csv('volc_lat_lons.csv')
# Create dataframe from db
dball = pd.read_sql_query("SELECT * FROM VolcDB1;", conn)