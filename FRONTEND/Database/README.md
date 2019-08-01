# Database Scripts

## Setting up the initial Database

1. Retrieve  data from [COMET API](https://comet.nerc.ac.uk/wp-json/volcanodb/v1/volcanoes?filter=0)
2. Clean data to suitable format using python script [retrieve_data.py](retrieve_data.py)
3. Turn csv into initial database (will need modifying to accommodate) [create_db.py](create_db.py)

volcano.db is created as an sqlite3 data base

 |   |    |         |   |  |   |
 |---|----|---------|---|--|---|
 | 0 | ID | INTEGER | 0 |  | 0 |
 | 1 |  characteristics_of_deformation  |  TEXT | 0 |  | 0
 | 2 | country | TEXT | 0 |  | 0 |
 | 3 | deformation_observation | TEXT | 0 |  | 0 |
 | 4 | duration_of_observation | TEXT | 0 |  | 0 |
 | 5 | geodetic_measurements | TEXT | 0 |  | 0 |
 | 6 | inferred_causes | TEXT | 0 |  | 0 |
 | 7 | latitude | REAL | 0 |  | 0 |
 | 8 | longitude | REAL | 0 |  | 0 |
 | 9 | measurement_methods | TEXT | 0 |  | 0 |
 | 10 | name | TEXT | 0 |  | 0 |
 | 11 | references | TEXT | 0 |  | 0 |
 | 12 | volcano_number | INTEGER | 0 |  | 0 |
 | 13 | image_url | TEXT | 0 |  | 0 |
 | 14 | Area | TEXT | 0 |  | 0 |
