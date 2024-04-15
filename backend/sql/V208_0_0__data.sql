
use pain;

create table coupons (
    id int primary key auto_increment,
    name varchar(255),
    pricing_data_id int,
    total float,
    perc float,
    reduction float,
    start_date date,
    end_date date,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into coupons (pricing_data_id,total,perc,reduction,start_date,end_date) values
(28,null,null,198,now(),date_add(now(),interval 12 month)),
(28,null,.25,null,now(),date_add(now(),interval 12 month)),
(28,599,null,null,now(),date_add(now(),interval 12 month));
