# -*- coding: utf-8 -*-
"""dump db
.. module::dump db
    :platform: Unix
    :synopis: dump useful csv file from the database
.. moduleauthor: Helen Burns (CEMAC-UoL)
.. description: This module was developed by CEMAC as part of COMET (Nerc)
   :copyright: © 2021 University of Leeds.
   :license: MIT
Example:
    To use::
Memebers:
.. CEMAC_VolcDB:
   https://github.com/cemac/COMET_VolcDB
"""

import pandas as pd
import sqlite3

# connect to volcano.db
conn = sqlite3.connect('volcano.db')
# Create dataframe from db
dball = pd.read_sql_query("SELECT * FROM VolcDB1;", conn)
conn.close()
<<<<<<< HEAD
volcanolist = dball[['name', 'latitude', 'longitude', 'ID']]
=======
volcanolist = dball[['jasmin_name', 'name', 'ID']]
>>>>>>> 0f175b46158e2d94163a40b2c85d8de21e41fd02
dbdump=dball[['jasmin_name', 'name', 'ID', 'country', 'geodetic_measurements',
              'deformation_observation', 'duration_of_observation',
              'characteristics_of_deformation', 'latitude', 'longitude',
              'measurement_methods', 'inferred_causes', 'references', 'Area',
              'date_edited']]
volcanolist.to_csv('volcano_list.csv', encoding='utf-8')
dbdump.to_csv('dbdump.csv', encoding='utf-8')
