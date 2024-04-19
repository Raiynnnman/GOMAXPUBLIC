
use pain;

alter table commission_bdr_users add column (
    invoices_id int,
    amount int not null default 0,
    office_id int,
    FOREIGN KEY (invoices_id) REFERENCES invoices(id),
    FOREIGN KEY (office_id) REFERENCES office(id)
);
