alter table VolcDB1 add column "Review needed" VARCHAR;
alter table VolcDB1 add column "date_edited" DATE;
alter table VolcDB1 add column "owner_id" TEXT;

create table VolcDB1_edits (
ID INTEGER NOT NULL,
characteristics_of_deformation TEXT,
country TEXT  NOT NULL,
deformation_observation TEXT,
duration_of_observation TEXT,
geodetic_measurements TEXT,
inferred_causes TEXT,
latitude REAL NOT NULL,
longitude REAL  NOT NULL,
measurement_methods TEXT,
name TEXT NOT NULL,
'references' TEXT,
"frames" TEXT,
Area TEXT  NOT NULL,
'Review needed' TEXT,
date_edited DATE,
owner_id integer NOT NULL,
FOREIGN KEY (owner_id) REFERENCES users (id)
FOREIGN KEY (ID) REFERENCES VolcDB1 (ID)
);

create table site_text (
ID INTEGER PRIMARY KEY,
current_words TEXT,
old_words TEXT,
type TEXT
);

create table images (
ID INTEGER PRIMARY KEY,
file TEXT,
size TEXT,
alttext TEXT,
link TEXT
);
