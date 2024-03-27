
use pain;

insert into office (name,active,billing_system_id) values ('Debora L Porter',1,2);
set @v = LAST_INSERT_ID();
insert into provider_queue (office_id,provider_queue_status_id,provider_queue_lead_strength_id) values (@v,30,1);
insert into office_plans (office_id,pricing_data_id,start_date,end_date) values (@v,29,now(),date_add(now(),interval 12 MONTH));
set @t = LAST_INSERT_ID();
insert into office_plan_items(description,office_plans_id) values ('#PAIN Introductory 3 Month Subscription',@t);
insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period) values (@v,15,@t,now());
set @i = LAST_INSERT_ID();
insert into invoice_items(invoices_id,description,price,quantity) values (@i,'#PAIN Introductory 3 Month Subscription',999,1);

insert into office (name,active,billing_system_id) values ('Susan M Carter',1,2);
set @v = LAST_INSERT_ID();
insert into provider_queue (office_id,provider_queue_status_id,provider_queue_lead_strength_id) values (@v,30,1);
insert into office_plans (office_id,pricing_data_id,start_date,end_date) values (@v,29,now(),date_add(now(),interval 12 MONTH));
set @t = LAST_INSERT_ID();
insert into office_plan_items(description,office_plans_id) values ('#PAIN Introductory 3 Month Subscription',@t);
insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period) values (@v,15,@t,now());
set @i = LAST_INSERT_ID();
insert into invoice_items(invoices_id,description,price,quantity) values (@i,'#PAIN Introductory 3 Month Subscription',999,1);


insert into office (name,active,billing_system_id) values ('Richard Robinson',1,2);
set @v = LAST_INSERT_ID();
insert into provider_queue (office_id,provider_queue_status_id,provider_queue_lead_strength_id) values (@v,30,1);
insert into office_plans (office_id,pricing_data_id,start_date,end_date) values (@v,29,now(),date_add(now(),interval 12 MONTH));
set @t = LAST_INSERT_ID();
insert into office_plan_items(description,office_plans_id) values ('#PAIN Introductory 3 Month Subscription',@t);
insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period) values (@v,15,@t,now());
set @i = LAST_INSERT_ID();
insert into invoice_items(invoices_id,description,price,quantity) values (@i,'#PAIN Introductory 3 Month Subscription',999,1);

insert into office (name,active,billing_system_id) values ('Jason Brooks',1,2);
set @v = LAST_INSERT_ID();
insert into provider_queue (office_id,provider_queue_status_id,provider_queue_lead_strength_id) values (@v,30,1);
insert into office_plans (office_id,pricing_data_id,start_date,end_date) values (@v,29,now(),date_add(now(),interval 12 MONTH));
set @t = LAST_INSERT_ID();
insert into office_plan_items(description,office_plans_id) values ('#PAIN Introductory 3 Month Subscription',@t);
insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period) values (@v,15,@t,now());
set @i = LAST_INSERT_ID();
insert into invoice_items(invoices_id,description,price,quantity) values (@i,'#PAIN Introductory 3 Month Subscription',999,1);


insert into office (name,active,billing_system_id) values ('Jaime Perez',1,2);
set @v = LAST_INSERT_ID();
insert into provider_queue (office_id,provider_queue_status_id,provider_queue_lead_strength_id) values (@v,30,1);
insert into office_plans (office_id,pricing_data_id,start_date,end_date) values (@v,29,now(),date_add(now(),interval 12 MONTH));
set @t = LAST_INSERT_ID();
insert into office_plan_items(description,office_plans_id) values ('#PAIN Introductory 3 Month Subscription',@t);
insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period) values (@v,15,@t,now());
set @i = LAST_INSERT_ID();
insert into invoice_items(invoices_id,description,price,quantity) values (@i,'#PAIN Introductory 3 Month Subscription',999,1);

insert into office (name,active,billing_system_id) values ('Christopher Usina, DC',1,2);
set @v = LAST_INSERT_ID();
insert into provider_queue (office_id,provider_queue_status_id,provider_queue_lead_strength_id) values (@v,30,1);
insert into office_plans (office_id,pricing_data_id,start_date,end_date) values (@v,29,now(),date_add(now(),interval 12 MONTH));
set @t = LAST_INSERT_ID();
insert into office_plan_items(description,office_plans_id) values ('#PAIN Introductory 3 Month Subscription',@t);
insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period) values (@v,15,@t,now());
set @i = LAST_INSERT_ID();
insert into invoice_items(invoices_id,description,price,quantity) values (@i,'#PAIN Introductory 3 Month Subscription',999,1);
