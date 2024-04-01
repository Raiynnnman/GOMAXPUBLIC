
use pain;
insert into office_type (id,name) values (5,'Referrer');

insert into users (email,first_name,last_name) values ('pmaszy_ref@gmail.com','Daul','Maszy');
set @v = LAST_INSERT_ID();

insert into office (name,email,office_type_id) values ('Daul Maszy Referrer','pmaszy_ref@gmail.com',5);
set @t = LAST_INSERT_ID();
insert into office_user (office_id,user_id) values (@t,@v);

insert into user_entitlements(user_id,entitlements_id) values
    (@v,'3'),
    (@v,'7');
insert into user_permissions(user_id,permissions_id) values
    (@v,'1');

create table referrer_users_status (
    id int primary key auto_increment,
    name varchar(255)
);

insert into referrer_users_status (id,name) values
(1,'QUEUED'),
(2,'REFERRED'),
(3,'SCHEDULED'),
(4,'RESCHEDULED');

create table referrer_documents (
    id int primary key auto_increment,
    office_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id)
);


create table referrer_users (
    id int primary key auto_increment,
    referrer_users_status_id int,
    email varchar(255),
    name varchar(255),
    phone varchar(255),
    office_id int,
    referrer_id int,
    user_id int,
    referred int not null default 0,
    row_meta mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (referrer_id) REFERENCES office(id),
    FOREIGN KEY (referrer_users_status_id) REFERENCES referrer_users_status(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into referrer_users (referrer_users_status_id,email,name,phone,referrer_id) values
    (1,'pmaszy_ref_user@gmail.com','Pau Ref','8326938998',@t);


