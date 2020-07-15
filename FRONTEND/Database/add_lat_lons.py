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
# Select where lat lon are missing
mlats = dball['latitude'].isnull()
for ind, row in dball.iterrows():
    if not mlats.iloc[ind] :
        continue
    jname = row.jasmin_name
    latlons=volcll.loc[volcll['Volcano'] == jname]
    dball.loc[ind,'latitude'] = latlons.Lat.values
    dball.loc[ind,'longitude'] = latlons.lon.values

dball.to_sql('VolcDB1', con=conn, if_exists='replace', index=False)
conn.close()

fulllls=pd.DataFrame()
fulllls['jasmin_name'] = dball['jasmin_name']
fulllls['latitude'] = dball['latitude']
fulllls['longitude'] = dball['longitude']
fulllls['Area'] = dball['Area']
fulllls.to_csv('volc_lat_lons.csv', encoding='utf-8')
