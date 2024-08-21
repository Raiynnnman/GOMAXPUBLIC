
update provider_queue_status set name='IN_NETWORK' where name = 'INVITED';
alter table office add column (account_summary mediumtext);
