CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TYPE votes AS (
    sum real,
    votes real
);

CREATE TABLE stores (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name varchar(48) NOT NULL,
    geom geography (point) NOT NULL,
    coords point, 
    image varchar(64),
    description varchar(64),
    address varchar(64),
    rating votes,
    debits real DEFAULT 0,
    credits real DEFAULT 0,
    date_created timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX global_poitns_gix ON stores USING GIST (geom);


CREATE TABLE tags(
    tag_name varchar(48)  PRIMARY KEY,
    purchased int DEFAULT 0,
    male_age_unkown int DEFAULT 0,
    male_age_13_17 int DEFAULT 0,
    male_age_18_24 int DEFAULT 0,
    male_age_25_34 int DEFAULT 0,
    male_age_35_44 int DEFAULT 0,
    male_age_45_54 int DEFAULT 0,
    male_age_55_64 int DEFAULT 0,
    male_age_65_plus int DEFAULT 0,
    female_age_unkown int DEFAULT 0,
    female_age_13_17 int DEFAULT 0,
    female_age_18_24 int DEFAULT 0,
    female_age_25_34 int DEFAULT 0,
    female_age_35_44 int DEFAULT 0,
    female_age_45_54 int DEFAULT 0,
    female_age_55_64 int DEFAULT 0,
    female_age_65_plus int DEFAULT 0,

    store_id uuid,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE CASCADE
);

CREATE TABLE products(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    product_name varchar(48),
    purchased int DEFAULT 0,
    store_id uuid,
    price real,
    description varchar(48),
    images varchar(64),
    tags varchar(48)[] DEFAULT '{}',
    date_created timestamp NOT NULL DEFAULT NOW(),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE CASCADE
);

CREATE TYPE gender AS ENUM (
    'male',
    'female'
);

CREATE TYPE paid_with AS ENUM (
    'cash',
    'loyalty_points'
);


CREATE TYPE order_status AS ENUM (
    'complete', 
    'pending', 
    'canceled'
);


CREATE TABLE users(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    store_id uuid REFERENCES stores (id),
    first_name varchar(64),
    last_name varchar(64),
    avatar varchar(256),
    email varchar(64),
    gender gender,
    birthday timestamp,
    loyalty_points real DEFAULT 0,
    groups jsonb,
    user_name varchar(64),
    password varchar(64),
    fb_id varchar(64),
    date_created timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE geo_log_events(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id uuid not null REFERENCES users (id),
    geom geography (point) NOT NULL,
    date_created timestamp NOT NULL DEFAULT NOW()
);


CREATE INDEX geo_log_events1 ON geo_log_events USING GIST (geom);

CREATE TABLE favorites (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id uuid not null REFERENCES users (id),
    product_id uuid not null REFERENCES products (id)
);


CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    store_id uuid REFERENCES stores (id),
    user_id uuid not null REFERENCES users (id),
    product_id uuid not null REFERENCES products (id),
    date_created timestamp NOT NULL DEFAULT NOW(),
    status order_status,
    paid_with paid_with NOT NULL,
    order_id varchar(36)
)
