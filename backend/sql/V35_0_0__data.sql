
use pain;

create table pricing_data (
    id int primary key auto_increment,
    price float not null default 0,
    locations int not null default 0,
    duration int not null default 0,
    slot int not null default 0,
    start_date DATE,
    end_date DATE,
    active int not null default 1,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

insert into pricing_data (price,locations,duration,start_date,end_date,active,slot) values 
(333,3,12,'2024-02-22','2025-02-22',1,1),
(399,3,6,'2024-02-22','2025-02-22',1,1),
(499,3,1,'2024-02-22','2025-02-22',1,1);




