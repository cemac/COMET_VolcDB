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
import random
import pandas as pd

mappings = pd.read_csv('mappings.csv')
duplicateRowsDF = mappings[mappings.duplicated['db_volcano_number']]
dupnums=duplicateRowsDF.db_volcano_number.notnull
# 5 results so there will be 10 volcanos with errors
# 345050 barva poas
# 311080 langjokull tanaga
# 211010 campi_flegrei vesuvius
# 324030 santa_maria wapi_lava_field
# 241040 reporoa white_island
# found the volcanoes by
mappings.loc[mappings['db_volcano_number']==345050]
# Load in the raw db
rawDF = pd.read_csv('volcanoes.csv')
rawDF.loc[rawDF['volcano_number']==345050]
# they are duplicated in the database 2 so assign new numbers
# 345050 barva = poas
# 311080 langjokull 3110801 tanaga
# 211010 campi_flegrei 2110101 vesuvius
# 324030 santa_maria 3240301 wapi_lava_field
# 241040 reporoa 2410401 white_island
vname=rawDF.loc[rawDF['volcano_number']==345050].values[1][2]
rawDF.loc[rawDF['name']==vname,'volcano_number']=3450501
