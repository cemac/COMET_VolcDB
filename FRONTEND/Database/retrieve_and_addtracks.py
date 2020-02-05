# -*- coding: utf-8 -*-
"""retrieve data
.. module:: retrieve data
    :platform: Unix
    :synopis: use comet API to retieve volcano database
.. moduleauthor: Helen Burns (CEMAC-UoL)
.. description: This module was developed by CEMAC as part of COMET (NERC)
   :copyright: © 2019 University of Leeds.
   :license: MIT
Example:
    To use::
Memebers:
.. CEMAC_VolcDB:
   https://github.com/cemac/COMET_VolcDB
"""
from pandas.io.json import json_normalize
import json
import pandas as pd

# volcanoes.json was obtained by
# https://comet.nerc.ac.uk/wp-json/volcanodb/v1/volcanoes?limit=0
# NB couldn't use python interface (forbidden?)

try:
    rawDF = pd.read_csv('volcanoes.csv')
    raw_images = pd.read_csv('volcano_image_library.csv')
except FileNotFoundError:
    with open('volcanoes.json') as json_file:
        data = json.load(json_file)
        rawDF = json_normalize(data)
        raw_images = json_normalize(data, 'images')

    rawDF.to_csv('volcanoes.csv', encoding='utf-8')
    raw_images.to_csv('volcano_image_library.csv', encoding='utf-8')
# Drop unneccessary columns inc odd named col
raw_data = rawDF.drop([rawDF.columns.values[0], 'api_endpoint', 'date_added',
                       'last_modified', 'uri', 'images', 'location'], axis=1)

# For now add the url so can have images on test site
# NOT REQUIRED
# raw_data['image_url'] = raw_images.url

# Now for each volcano get location information!
# Really I'm just extracting the region
with open('volcanoes.json') as json_file:
        data = json.load(json_file)
        locationdf = pd.DataFrame()
        for i in range(len(data)):
            try:
                row = json_normalize(data[i]['location'])
            except KeyError:
                print('filling row with zeros')
                row[:] = 'none'
            locationdf = locationdf.append(row)

locationdf = locationdf.reset_index(drop=True)
locationdf.to_csv('volcano_location_data.csv', encoding='utf-8')
raw_data['Area'] = locationdf.name
# re index by name and prepare to put in frame info
raw_data_names = raw_data.copy()
raw_data.set_index('name', inplace=True)
raw_data['frames'] = ''
# For each volcano check if there is corresponding frame information
with open('all_volcs.json') as json_file:
        data = json.load(json_file)
        for i in range(len(raw_data_names)):
            vnameraw = raw_data_names.name[i]
            vname = str(vnameraw).lower().replace(' ', '_')
            vname = vname.replace('-', '_')
            try:
                #framesdf = json_normalize(data[vname])
                framesdf = data[vname]
                raw_data.loc[vnameraw].frames = framesdf
            except KeyError:
                print('skipping ' + vname)
# put the name back into dataframe and index by number
raw_data = raw_data.reset_index()
# Save to csv
raw_data = raw_data.rename(columns={"volcano_number": "ID"})
raw_data.to_csv('VolcDB_df.csv', index=False)
# Save lat lons for outside plotting
volcloc = raw_data[['name', 'latitude', 'longitude']]
volcloc.to_csv('volc_lat_lons.csv', encoding='utf-8')
