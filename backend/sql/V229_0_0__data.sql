
use pain;
create table pricing_data_benefits (
    id int primary key auto_increment,
    pricing_data_id int,
    description varchar(255),
    slot int not null default 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

insert into pricing_data_benefits(pricing_data_id,description,slot) values 
(26,'Annual Subscription',0),
(26,'12 Month Plan',1),
(26,'Save 25%',2),
(26,'Auto Scheduling - First Appointment',3),
(26,'Lower Marketing CoA, Higher ROI',4),
(26,'Powerful, Targeted Advertising Co-Op',5),
(26,'Hassle-free Autopay Billing',6),
(26,'Renews Every 12 Months',7);

insert into pricing_data_benefits(pricing_data_id,description,slot) values 
(27,'Semi Annual Subscription',0),
(27,'6 Month Plan',1),
(27,'Save 17%',2),
(27,'Auto Scheduling - First Appointment',3),
(27,'Lower Marketing CoA, Higher ROI',4),
(27,'Powerful, Targeted Advertising Co-Op',5),
(27,'Hassle-free Autopay Billing',6),
(27,'Renews Every 6 Months',7);

insert into pricing_data_benefits(pricing_data_id,description,slot) values 
(28,'Quarterly Subscription',0),
(28,'3 Month Plan',1),
(28,'Save',2),
(28,'Auto Scheduling - First Appointment',3),
(28,'Lower Marketing CoA, Higher ROI',4),
(28,'Powerful, Targeted Advertising Co-Op',5),
(28,'Hassle-free Autopay Billing',6),
(28,'Renews Every 12 Months',7);
