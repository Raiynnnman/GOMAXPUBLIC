
use pain;

create table provider_queue_call_status (
    id int primary key auto_increment,
    name varchar(255)
);

create table provider_queue_actions(
    id int primary key auto_increment,
    provider_queue_id int,
    user_id int,
    action mediumtext,
    FOREIGN KEY (provider_queue_id) REFERENCES provider_queue(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into provider_queue_status (id,name) values
(5,'WARMING'),
(10,'NEGOTIATING'),
(15,'LOST_DEAL'),
(42,'DO_NOT_CONTACT');
update provider_queue_status set name='WON' where id=20;

alter table provider_queue add column 
(
provider_queue_call_status_id int,
FOREIGN KEY (provider_queue_call_status_id) REFERENCES provider_queue_call_status(id)
);

insert into provider_queue_call_status (name) values 
('WORKING W(OB)-ATTEMPT 1'),
('W(OB)-ATTEMPT 2'), 
('W(OB)-ATTEMPT 3'),
('W(OB)-ATTEMPT 4'),
('W(OB)-ATTEMPT 5'),
('W(OB)-ATTEMPT 5+'),
('W(IB)-ATTEMPT 1'),
('W(IB)-ATTEMPT 2'),
('W(IB)-ATTEMPT 3'),
('W(IB)-ATTEMPT 4'),
('W(IB)-ATTEMPT 5'),
('W(IB)-ATTEMPT 5 +'),
('NURTURING N(OB) - APP SET'),
('N(OBT) -CALL BACK SCHEDULED'),
('N(OBT) -POST APP F/U 1'),
('N(OBT) -POST APP F/U 2'),
('N(OBT) POST APP F/U 3'),
('N(OBT) - APP F/U 3+'),
('N(OBT) - APP SET'),
('N(IB) -CALL BACK SCHEDULED'),
('N(IB) -POST APP F/U 1'),
('N(IB) -POST APP F/U 2'),
('N(IB) POST APP F/U 3'),
('N(IB) POST APP F/U 3+'),
('N(IB) - APP SET'),
('N(IBT) -CALL BACK SCHEDULED'),
('N(IBT) -POST APP F/U 1'),
('N(IBT) -POST APP F/U 2'),
('N(IBT) POST APP F/U 3'),
('N(IBT) POST APP F/U 3+');
