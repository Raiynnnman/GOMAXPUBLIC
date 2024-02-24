
use pain;
create table office_plans (
    id int primary key auto_increment,
    office_id int,
    start_date DATE,
    end_date DATE,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id)
);

create table office_plan_items (
    id int primary key auto_increment,
    office_plans_id int,
    price float,
    description varchar(255),
    quantity int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (office_plans_id) REFERENCES office_plans(id)
);

insert into office_plans (office_id,start_date,end_date) values
(1,'2024-02-22','2025-02-22');

set @v = LAST_INSERT_ID();

insert into office_plan_items (office_plans_id, price,description,quantity) values
(@v,399,"1 Year Plan",1),
(@v,-10,"Discount",1);


insert into office_plans (office_id,start_date,end_date) values
(2,'2024-02-22','2025-02-22');

set @v = LAST_INSERT_ID();

insert into office_plan_items (office_plans_id, price,description,quantity) values
(@v,499,"6 Month Plan",1),
(@v,25,"Additional Offices",1);

insert into office_plans (office_id,start_date,end_date) values
(3,'2024-02-22','2025-02-22');

set @v = LAST_INSERT_ID();

insert into office_plan_items (office_plans_id, price,description,quantity) values
(@v,599,"6 Month Plan",1),
(@v,-25,"Discount",1),
(@v,25,"Additional Offices",1);

insert into office_plans (office_id,start_date,end_date) values
(4,'2024-02-22','2025-02-22');

set @v = LAST_INSERT_ID();

insert into office_plan_items (office_plans_id, price,description,quantity) values
(@v,599,"6 Month Plan",1),
(@v,-15,"Discount",1),
(@v,50,"Additional Offices",1);
