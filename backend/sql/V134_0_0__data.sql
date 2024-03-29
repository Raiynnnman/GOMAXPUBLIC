use pain;
update office_plans set start_date='2024-03-15' where office_id=54;
update office_plans set start_date='2024-03-07' where office_id=28;
update office_plans set start_date='2024-03-14' where office_id=32;
update office_plans set start_date='2024-03-28' where office_id=34;
update office_plans set start_date='2024-03-09' where office_id=22;
update office_plans set start_date='2024-03-08' where office_id=9;
update office_plans set start_date='2024-03-06' where office_id=12;
update office_plans set start_date='2024-03-03' where office_id=14;
update office_plans set start_date='2024-03-07' where office_id=45;
update office_plans set start_date='2024-03-04' where office_id=6;
update office_plans set start_date='2024-03-29' where office_id=10;
update office_plans set start_date='2024-03-31' where office_id=25;
update office_plans set start_date='2024-03-29' where office_id=26;
update office_plans set start_date='2024-03-29' where office_id=30;
update office_plans set start_date='2024-03-31' where office_id=59;
update office_plans set start_date='2024-03-29' where office_id=52;
update office_plans set start_date='2024-03-29' where office_id=60;
update office_plans set start_date='2024-03-26' where office_id=17;
update office_plans set start_date='2024-03-23' where office_id=20;
update office_plans set start_date='2024-03-23' where office_id=51;
update office_plans set start_date='2024-03-22' where office_id=42;
update office_plans set start_date='2024-03-19' where office_id=19;
update office_plans set start_date='2024-03-18' where office_id=11;
update office_plans set start_date='2024-03-17' where office_id=8;
update office_plans set start_date='2024-03-15' where office_id=23;
update office_plans set start_date='2024-03-01' where office_id=29;
update office_plans set start_date='2024-03-15' where office_id=55;
update office_plans set start_date='2024-03-24' where office_id=47;
update office_plans set start_date='2024-03-17' where office_id=21;
update office_plans set start_date='2024-03-17' where office_id=46;
update office_plans set start_date='2024-03-15' where office_id=33;
update office_plans set start_date='2024-03-03' where office_id=13;
update office_plans set start_date='2024-03-14' where office_id=41;
update office_plans set start_date='2024-03-13' where office_id=7;
update office_plans set start_date='2024-03-07' where office_id=40;
update office_plans set start_date='2024-03-03' where office_id=43;
update office_plans set start_date='2024-03-14' where office_id=56;
update office_plans set start_date='2024-03-28' where office_id=35;
update office_plans set start_date='2024-03-27' where office_id=15;
update office_plans set start_date='2024-03-26' where office_id=50;
update office_plans set start_date='2024-03-25' where office_id=38;
update office_plans set start_date='2024-03-25' where office_id=49;
update office_plans set start_date='2024-03-24' where office_id=61;
update office_plans set start_date='2024-03-27' where office_id=36;
update office_plans set start_date='2024-03-24' where office_id=39;
update office_plans set start_date='2024-03-24' where office_id=16;
update office_plans set start_date='2024-03-25' where office_id=37;
update office_plans set start_date='2024-03-25' where office_id=48;
update office_plans set start_date='2024-03-24' where office_id=18;
update office_plans set start_date='2024-03-24' where office_id=44;
update office_plans set start_date='2024-03-18' where office_id=13034;
update office_plans set start_date='2024-03-14' where office_id=13035;
update office_plans set start_date='2024-03-13' where office_id=13036;
update office_plans set start_date='2024-03-11' where office_id=13037;
update office_plans set start_date='2024-03-11' where office_id=13038;
update office_plans set start_date='2024-03-11' where office_id=13039;

insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-03-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');

insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-04-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');


insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-05-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');

insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-06-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');


insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-07-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');

insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-08-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');


insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-09-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');

insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-10-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');

insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-11-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');

insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2024-12-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');

insert into invoices (office_id,invoice_status_id,billing_period) 
    values (51,15,'2025-01-23');
set @v = LAST_INSERT_ID();
insert into invoice_items (invoices_id,price,quantity,description) values
    (@v,0,1,'Annual Subscription');


update office set stripe_cust_id=null,billing_system_id = 2 where id=51;
