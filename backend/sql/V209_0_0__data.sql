
delete from coupons;
insert into coupons (name,pricing_data_id,total,perc,reduction,start_date,end_date) values
("Coupon Test Reduction",28,null,null,198,now(),date_add(now(),interval 12 month)),
("Coupon Test Percentage",28,null,.25,null,now(),date_add(now(),interval 12 month)),
("Coupon Test Total",28,599,null,null,now(),date_add(now(),interval 12 month));
