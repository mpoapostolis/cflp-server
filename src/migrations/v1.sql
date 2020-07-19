CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE votes AS (
    sum int,
    votes int
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
    date_created timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX global_poitns_gix ON stores USING GIST (geom);

CREATE TYPE age_group AS (
    unkown int,
   "13-17" int,
   "18-24" int,
   "25-34" int,
   "35-44" int,
   "45-54" int,
   "55-64" int,
   "65+" int
);

CREATE TYPE item_analytics AS (
    purchased int,
    male int,
    female int,
    age_group age_group
);



CREATE TABLE tags(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tag_name varchar(48)
);

CREATE TABLE products(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    product_name varchar(48),
    store_id uuid,
    price real,
    lp_price real,
    lp_reward real,
    analytics item_analytics,
    description varchar(48),
    images varchar(64),
    date_created timestamp NOT NULL DEFAULT NOW(),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE CASCADE
);

CREATE TABLE products_tags (
    product_id uuid,
    tag_id uuid,
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON UPDATE CASCADE
);


CREATE TYPE gender AS ENUM (
    'male',
    'female'
);

CREATE TABLE users(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    store_id uuid REFERENCES stores (id),
    first_name varchar(64),
    last_name varchar(64),
    avatar varchar(256),
    email varchar(64),
    gender gender,
    loyalty_points json,
    groups json,
    favorites uuid[],
    user_name varchar(64),
    password varchar(64),
    fb_id varchar(64),
    date_created timestamp NOT NULL DEFAULT NOW()
);


CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id uuid not null REFERENCES users (id),
    product_id uuid not null REFERENCES products (id),
    date_created timestamp NOT NULL DEFAULT NOW()
)
