
use pain;

alter table office add column (
    commission_user_id int,
    FOREIGN KEY (commission_user_id) REFERENCES users(id)
);


insert into entitlements (id,name) values (10,'Commissions');

select id into @v from users where  email='rain@poundpain.com';
insert into user_entitlements(user_id,entitlements_id) values (@v,10);

select id into @v from users where  email='paul@poundpain.com';
insert into user_entitlements(user_id,entitlements_id) values (@v,10);

select id into @v from users where  email='christi@poundpain.com';
insert into user_entitlements(user_id,entitlements_id) values (@v,10);

select id into @v from users where  email='daphne@poundpain.com';
insert into user_entitlements(user_id,entitlements_id) values (@v,10);
update office set commission_user_id = @v where active = 1;

create table commission_structure (
    id int primary key auto_increment,
    pricing_data_id int,
    commission float,
    renewal_bonus float,
    start_date date,
    end_date date,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

select id into @t from pricing_data where description='#PAIN Annual Subscription';
insert into commission_structure (pricing_data_id,commission,renewal_bonus,start_date,end_date) values 
    (@t,.25,300,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN 6 Month Subscription';
insert into commission_structure (pricing_data_id,commission,renewal_bonus,start_date,end_date) values 
    (@t,.25,150,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN 3 Month Subscription';
insert into commission_structure (pricing_data_id,commission,renewal_bonus,start_date,end_date) values 
    (@t,.25,150,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN Introductory 3 Month Subscription';
insert into commission_structure (pricing_data_id,commission,renewal_bonus,start_date,end_date) values 
    (@t,0,0,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN Introductory Setup';
insert into commission_structure (pricing_data_id,commission,renewal_bonus,start_date,end_date) values 
    (@t,0,0,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN In-Network';
insert into commission_structure (pricing_data_id,commission,renewal_bonus,start_date,end_date) values 
    (@t,0,0,now(),date_add(now(),interval 12 month));

create table commission_users (
    id int primary key auto_increment,
    user_id int,
    commission_structure_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (commission_structure_id) REFERENCES commission_structure(id)

);
