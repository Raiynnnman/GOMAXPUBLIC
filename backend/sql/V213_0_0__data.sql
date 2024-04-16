
use pain;
create table jenkins_jobs (
    id int primary key auto_increment,
    class varchar(255),
    job varchar(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into jenkins_jobs(class,job) values ('RegistrationUpdate','stripe-invoices');
insert into jenkins_jobs(class,job) values ('RegistrationList','stripe-invoices');

