
use pain;


create table user_addresses (
    id int primary key auto_increment,
    user_id int,
    addr1 varchar(255),
    city varchar(255),
    state varchar(255),
    zip varchar(64),
    places_id varchar(255),
    fulladdr varchar(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)

);

create table client_intake (
    id int primary key auto_increment,
    user_id int,
    date_of_accident DATE,
    description mediumtext,
    hospital int not null default 0,
    ambulance int not null default 0,
    witnesses mediumtext,
    pics_of_damange int not null default 0,
    rep_law_enforcement varchar(255),
    police_report_num varchar(64),
    citations varchar(255),
    citations_person varchar(255),
    passengers mediumtext,
    def_insurance varchar(255),
    def_claim_num varchar(255),
    def_name varchar(255),
    ins_info varchar(255),
    ins_claim_num varchar(255),
    ins_policy_holder varchar(255),
    case_num varchar(255),
    case_verification_who varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)

);

create table client_intake_offices (
    id int primary key auto_increment,
    client_intake_id int,
    office_id int,
    attorney_sign int not null default 0,
    attorney_sign_date DATE,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_intake_id) REFERENCES client_intake(id),
    FOREIGN KEY (office_id) REFERENCES office(id)
);

create table client_intake_pictures (
    id int primary key auto_increment,
    client_intake_id int,
    fname varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_intake_id) REFERENCES client_intake(id)
);
