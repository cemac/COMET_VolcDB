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
from sqlalchemy import create_engine

# connect to volcano.db
conn = sqlite3.connect('volcano.db')
df = pd.read_csv('VolcDB_df.csv', index)
# NB pandas is due to change behaviour to not underscore column names
# Replace table VolcDB1
df.to_sql('VolcDB1', con=conn, if_exists='replace', index=False)
conn.close()
