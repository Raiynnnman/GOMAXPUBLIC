
use pain;
create table provider_queue_source (
    id int primary key auto_increment,
    name varchar(255)
);
insert into provider_queue_source (name) values
('UNKNOWN'),
('EMAIL_CAMPAIGN'),
('FACEBOOK'),
('INSTAGRAM'),
('LEADS'),
('MARKETING_EMAIL_CAMPAIGN'),
('PREVIOUS_PENDING_DEAL'),
('SALES_EMAIL_CAMPAIGN');

create table provider_queue_presented_status (
    id int primary key auto_increment,
    name varchar(255)
);

insert into provider_queue_presented_status (name) values
('Executed'),('Pending');

alter table provider_queue add column (
    provider_queue_source_id int,
    provider_queue_presented_status_id int,
    set_date DATE,
    include_on_deal_tracker int not null default 0,
    present_date DATE,
    estimated_close_date DATE,
    close_requirements mediumtext,
    closed_date DATE,
    refund_requested int not null default 0,
    FOREIGN KEY (provider_queue_source_id) REFERENCES provider_queue_source(id),
    FOREIGN KEY (provider_queue_presented_status_id) REFERENCES provider_queue_presented_status(id)
);

