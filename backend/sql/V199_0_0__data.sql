
use pain;
create table office_history (
    id int primary key auto_increment,
    user_id int,
    office_id int,
    text varchar(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (office_id) REFERENCES office(id)
);

insert into office_history(office_id,user_id,text) values (50,1,'System Updated for history');

create table provider_queue_history (
    id int primary key auto_increment,
    user_id int,
    provider_queue_id int,
    text varchar(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (provider_queue_id) REFERENCES provider_queue(id)
);
insert into provider_queue_history(provider_queue_id,user_id,text) values (45,1,'System Updated for history');
