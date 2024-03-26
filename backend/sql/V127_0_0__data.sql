
use pain;

alter table office add column (places_id varchar(255));
alter table provider_queue add column (places_id varchar(255));

create table office_potential_places (
    id int primary key auto_increment,
    office_id int,
    office_addresses_id int,
    name varchar(64),
    places_id varchar(64),
    addr1 varchar(255),
    phone varchar(255),
    city varchar(255),
    state varchar(255),
    zipcode varchar(255),
    score float,
    lat float,
    lon float,
    website varchar(255),
    google_url varchar(255),
    rating float,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (office_addresses_id) REFERENCES office_addresses(id)
);
