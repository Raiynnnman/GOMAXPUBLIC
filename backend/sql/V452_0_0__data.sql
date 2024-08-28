
alter table client_intake add column (
    assignee_id int,
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

update provider_queue set provider_queue_status_id=10 where provider_queue_status_id=39;
delete from provider_queue_status where id=49;

update provider_queue set provider_queue_status_id=51 where provider_queue_status_id=20;
delete from provider_queue_status where id=20;

update provider_queue_status set name = 'PAYMENT_PENDING' where id=51;
