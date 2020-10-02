# -*- coding: utf-8 -*-
"""create db
.. module:: create db
    :platform: Unix
    :synopis: Mass update of frames and check against smithonian database
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
smiths1 = pd.read_csv('smithsonian_vols.csv', encoding='latin-1')
# Create dataframe from db
dball = pd.read_sql_query("SELECT * FROM VolcDB1;", conn)
# Task 1 check agains smithonian db
# make sure integers to match
dball.ID = dball.ID.astype(int)
# make counters to check how many entries don't have corresponding values
count = 0
count2 = 0
# Volcano names are in Camel Caps in smithonian
# But mixed in ours so were going to check our names against
# the smithonian name , its lower case version, and version with
# underscores
smiths2 = pd.read_csv('smithsonian_vols.csv', encoding='latin-1')
smiths2['Volcano Name'] = smiths2['Volcano Name'].str.lower()
smiths3 = pd.read_csv('smithsonian_vols.csv', encoding='latin-1')
smiths3['Volcano Name'] = smiths3['Volcano Name'].str.lower().str.replace(' ', '_')
smiths1.set_index('Volcano Name', inplace=True)
smiths2.set_index('Volcano Name', inplace=True)
smiths3.set_index('Volcano Name', inplace=True)
# Loop over every row
for row in dball.iterrows():
    # Volcano name
    vname = row[1]['name']
    if vname == 'Unnamed':
        # Skip Unnamed
        continue
    # Crude pattern match smithonian name
    try:
        volc = smiths1.loc[vname]
    except KeyError:
        try:
            volc = smiths2.loc[vname]
        except KeyError:
            try:
                volc = smiths3.loc[vname]
            except KeyError:
                # Not all volcanoes are in the database I did a manual check
                print(vname .lower() + ' not in database')
                count += 1
                continue
    # check ID, Region, Country, lat lons
    try:
        if volc['Volcano Number'] == row[1]['ID']:
            print('pass ID')
        else:
            print('fail ID')
            count2 += 1
            dball.at[row[0], 'ID'] = volc['Volcano Number']
        # country
        try:
            if volc['Country'].lower() == row[1]['country'].lower():
                print('pass country')
            else:
                dball.at[row[0], 'country'] = volc['Country']
            # region
            if volc['Region'].lower() == row[1]['Area'].lower():
                print('pass region')
            else:
                dball.at[row[0], 'Area'] = volc['Region']
            # lat
            if volc['Latitude'] == row[1]['latitude']:
                print('pass lat')
            else:
                dball.at[row[0], 'latitude'] = volc['Latitude']
            # lon
            if volc['Longitude'] == row[1]['longitude']:
                print('pass lon')
            else:
                dball.at[row[0], 'longitude'] = volc['Longitude']
        except AttributeError:
            # A few volcano just have a name and no info so fill in from smithonian
            print('AttributeError normally from missing info')
            print('Replace VolcDB data with smithonian')
            dball.at[row[0], 'country'] = volc['Country']
            dball.at[row[0], 'Area'] = volc['Region']
            dball.at[row[0], 'latitude'] = volc['Latitude']
            dball.at[row[0], 'longitude'] = volc['Longitude']
    except ValueError:
        # I'm not sure why but I got a tuple error with (volc,), bypass this
        # by selecting volc
        # unecessary duplicated code
        if int(volc['Volcano Number'][0]) == row[1]['ID']:
            print('pass ID')
        else:
            print('fail ID')
            dball.at[row[0], 'ID'] = volc['Volcano Number'][0]
        # country
        if volc['Country'][0].lower() == row[1]['country'].lower():
            print('pass country')
        else:
            dball.at[row[0], 'country'] = volc['Country'][0]
        # region
        if volc['Region'][0].lower() == row[1]['Area'].lower():
            print('pass region')
        else:
            dball.at[row[0], 'Area'] = volc['Region'][0]
        # lat
        if volc['Latitude'][0] == row[1]['latitude']:
            print('pass lat')
        else:
            dball.at[row[0], 'latitude'] = volc['Latitude'][0]
        # lon
        if volc['Longitude'][0] == row[1]['longitude']:
            print('pass lon')
        else:
            dball.at[row[0], 'longitude'] = volc['Longitude'][0]
# Get IDs and check from duplicated
ids = dball.ID
print('duplicated')
ndups = dball[ids.isin(ids[ids.duplicated()])]
print(ndups)
# if there's duplcates remove them, identified by missing jasmin name
if len(ndups) > 1:
    # find IDs of those duplicated
    dupids = dball[ids.isin(ids[ids.duplicated()])].sort_values('ID')
    jasminpresent = dupids.jasmin_name.notnull()
    missingjasmins = dupids.where(jasminpresent == False)
    idxtodrop = missingjasmins.dropna(subset=['name']).index
    dball.drop(idxtodrop, inplace=True)
    print('duplicated')
    ids = dball.ID
    ndups = dball[ids.isin(ids[ids.duplicated()])]
    print(ndups)
    if len(ndups) > 1:
        # Or incorrect jasmin names
        idxtodrop = ndups.where(ndups.jasmin_name != ndups.name).dropna(
            subset=['jasmin_name']).index
        dball.drop(idxtodrop, inplace=True)
        ids = dball.ID
        print('duplicated')
        ndups = dball[ids.isin(ids[ids.duplicated()])]
        print(ndups)
# missing a bunch of volcanoes - test checking lower against lower
raw_data_names = dball.copy()
dball.set_index('jasmin_name', inplace=True)
# open the JSON file and add in the frame data
with open('jasmin_volcanoes_and_frames/all_volcs.json') as json_file:
    data = json.load(json_file)
    for i in range(len(raw_data_names)):
        vname = raw_data_names.iloc[i].jasmin_name
        try:
            framesdf = data[vname]
            dball.at[str(vname), 'frames'] = str(framesdf)
        except KeyError:
            print('skipping ' + str(vname))
dball.reset_index(inplace=True)
# Replace Nones with strings
dball.country.fillna('none', inplace=True)
dball.Area.fillna('none', inplace=True)
dball.frames.fillna('none', inplace=True)
# Overwrite VolcDB1 in db file
dball.to_sql('VolcDB1', con=conn, if_exists='replace', index=False)
conn.close()
# This might liead to read only database - setfacl and restart app req
