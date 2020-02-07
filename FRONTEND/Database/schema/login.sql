create table users_roles (
id integer,
group_id integer,
PRIMARY KEY (id, group_id),
CONSTRAINT user_id
FOREIGN KEY (id) REFERENCES users (id)
ON DELETE CASCADE ON UPDATE NO ACTION,
CONSTRAINT role_id
FOREIGN KEY (group_id) REFERENCES roles (group_id)
ON DELETE CASCADE ON UPDATE NO ACTION
);

create table users (
id integer primary key autoincrement,
username text not null,
password text not null,
affiliation text,
email text,
consent text
);

create table roles (
group_id integer PRIMARY KEY,
name text NOT NULL
);
