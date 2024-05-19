
use pain;
alter table client_intake add column (attny_name varchar(255));
alter table client_intake add column (sha256 varchar(64) unique);
