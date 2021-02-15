# -*- coding: utf-8 -*-
"""create db
.. module:: create db
    :platform: Unix
    :synopis: Add subset column
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
import json
import numpy as np
from sqlalchemy import create_engine

# connect to volcano.db
conn = sqlite3.connect('volcano.db')
# load in smithonian dataset nb encoding
subset = pd.read_csv('smithsonian_vols.csv', encoding='latin-1')
# Create dataframe from db
dball = pd.read_sql_query("SELECT * FROM VolcDB1;", conn)
dball['subset']='N'
for row in dball.iterrows():
    if row[1]['jasmin_name'] in subset.values:
        print(row[1]['jasmin_name'])
        dball.at[row[0], 'subset'] = 'Y'
    elif row[1]['name'] in subset.values:
        print(row[1]['name'] )
        dball.at[row[0], 'subset'] = 'Y'
    else:
        continue


dball.to_sql('VolcDB1', con=conn, if_exists='replace', index=False)
conn.close()
# This might liead to read only database - setfacl and restart app req
