use pain;

create table if not exists billing_system (
    id int primary key auto_increment,
    name varchar(255)
);

insert into billing_system (id,name) values (1,'Stripe');
insert into billing_system (id,name) values (2,'Square');

create table billing_system_current (
    id int primary key auto_increment,
    billing_system_id int,
    FOREIGN KEY (billing_system_id) REFERENCES billing_system(id)
);
insert into billing_system_current (billing_system_id) values (2);

alter table invoices add column (
    billing_system_id int,
    FOREIGN KEY (billing_system_id) REFERENCES billing_system(id)
);

update invoices set billing_system_id = 1;

