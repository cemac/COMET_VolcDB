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
# load in smithonian dataset nb encoding
smiths=pd.read_csv('smithsonian_vols.csv', encoding='latin-1')
# Create dataframe from db
dball = pd.read_sql_query("SELECT * FROM VolcDB1;", conn)
# Task 1 check agains smithonian db
# make sure integers to match
dball.ID = dball.ID.astype(int)
smiths['Volcano Name'].str.lower()
smiths.set_index('Volcano Name',inplace=True)
for row in dball.iterrows(): 
    vname = row[1]['name']
    if vname=='Unnamed':
        continue
    try:
        volc = smiths.loc[vname.lower()]
        if len(volc) > 1:
            volc=volc.where(volc['Volcano Number']==row[1]['ID'])
            volc.dropna(inplace=True) 
    except:
        try:
            volc = smiths.loc[vname.lower().replace('_', ' ')]
            if len(volc) > 1:
                volc=volc.where(volc['Volcano Number']==row[1]['ID'])
                volc.dropna(inplace=True) 
        except:
            print(vname .lower() + ' not in database')
        continue
    # check
    try:
        if volc['Volcano Number']==row[1]['ID']:
            print('pass ID')
        else:
            print('fail ID')
            dball.at[row[0],'ID']=volc['Volcano Number']
        # country    
        if volc['Country'].lower()==row[1]['country'].lower():
            print('pass country')
        else:
            dball.at[row[0],'country']=volc['Country']
        # region
        if volc['Region'].lower()==row[1]['Area'].lower():
            print('pass region')
        else:
            dball.at[row[0],'Area']=volc['Region']
        # lat
        if volc['Latitude']==row[1]['latitude']:
            print('pass lat')
        else:
            dball.at[row[0],'latitude']=volc['Latitude']
        # lon
        if volc['Longitude']==row[1]['longitude']:
            print('pass lon')
        else:
            dball.at[row[0],'longitude']=volc['Longitude']
    except ValueError:
        if volc['Volcano Number'][0]==row[1]['ID']:
            print('pass ID')
        else:
            print('fail ID')
            dball.at[row[0],'ID']=volc['Volcano Number'][0]
        # country    
        if volc['Country'][0].lower()==row[1]['country'].lower():
            print('pass country')
        else:
            dball.at[row[0],'country']=volc['Country'][0]
        # region
        if volc['Region'][0].lower()==row[1]['Area'].lower():
            print('pass region')
        else:
            dball.at[row[0],'Area']=volc['Region'][0]
        # lat
        if volc['Latitude'][0]==row[1]['latitude']:
            print('pass lat')
        else:
            dball.at[row[0],'latitude']=volc['Latitude'][0]
        # lon
        if volc['Longitude'][0]==row[1]['longitude']:
            print('pass lon')
        else:
            dball.at[row[0],'longitude']=volc['Longitude'][0]
# missing a bunch of volcanoes - test checking lower against lower
raw_data_names = dball.copy()
raw_data_names.set_index('jasmin_name', inplace=True)
with open('jasmin_volcanoes_and_frames/all_volcs.json') as json_file:
        data = json.load(json_file)
        for i in range(len(raw_data_names)):
            vname = raw_data_names.jasmin_name[i]
            #vname = str(vnameraw).lower().replace(' ', '_')
            #vname = vname.replace('-', '_')
            try:
                #framesdf = json_normalize(data[vname])
                framesdf = data[vname]
                raw_data_names.at[str(vname),'frames']=str(framesdf)
            except KeyError:
                print('skipping ' + str(vname))
raw_data = raw_data_names.copy()
raw_data = raw_data.reset_index('volcano_number',inplace=True)