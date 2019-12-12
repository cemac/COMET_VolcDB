# -*- coding: utf-8 -*-
"""retrieve data
.. module:: retrieve data
    :platform: Unix
    :synopis: use comet API to retieve volcano database
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
from pandas.io.json import json_normalize
import json
import pandas as pd

# volcanoes.json was obtained by
# https://comet.nerc.ac.uk/wp-json/volcanodb/v1/volcanoes?filter=0
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
raw_data['image_url'] = raw_images.url

# Now for each volcano get location information!
with open('volcanoes.json') as json_file:
        data = json.load(json_file)
        locationdf = json_normalize(data[0]['location'])
        for i in range(len(data)):
            if i == 0:
                continue
            try:
                row = json_normalize(data[i]['location'])
            except KeyError:
                print('filling row with zeros')
                row.loc[0] = 0
            locationdf = locationdf.append(row)

locationdf.to_csv('volcano_location_data.csv', encoding='utf-8')
raw_data['Area'] = locationdf.name
# Save to csv
raw_data.to_csv('VolcDB_df.csv')
volcloc = raw_data[['name', 'latitude', 'longitude']]
volcloc.to_csv('volc_lat_lons.csv', encoding='utf-8')
