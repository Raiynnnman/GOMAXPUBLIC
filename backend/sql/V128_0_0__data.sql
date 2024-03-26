
use pain;
alter table ratings add column (
    office_id int,
    FOREIGN KEY (office_id) references office(id)
);
