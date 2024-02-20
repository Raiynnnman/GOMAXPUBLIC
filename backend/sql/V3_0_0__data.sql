
use pain;
create table if not exists status ( id INT PRIMARY KEY AUTO_INCREMENT, value varchar(32) unique);
create table if not exists job_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    job_id int, 
    status_id int not null default 0, 
    created timestamp default CURRENT_TIMESTAMP);
create table if not exists jobs ( 
    id INT PRIMARY KEY AUTO_INCREMENT, job_id varchar(255) unique, 
    curr_status int, updated timestamp default CURRENT_TIMESTAMP, 
    created timestamp default CURRENT_TIMESTAMP);
insert into status (value) values ('QUEUED');
insert into status (value) values ('STARTED');
insert into status (value) values ('RUNNING');
insert into status (value) values ('COMPLETE');
insert into status (value) values ('ERROR');
create table if not exists errorlog (
    id INT PRIMARY KEY AUTO_INCREMENT, job_id int, 
    classname varchar(32), filename varchar(255), 
    updated timestamp default CURRENT_TIMESTAMP, created timestamp default CURRENT_TIMESTAMP);
create table if not exists joblog (
    id INT PRIMARY KEY AUTO_INCREMENT, job_id int, classname varchar(32), 
    filename varchar(255), updated timestamp default CURRENT_TIMESTAMP, created timestamp default CURRENT_TIMESTAMP);
alter table errorlog add column (data mediumtext);
alter table joblog add column (data mediumtext);
