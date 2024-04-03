
use pain;

create table invoice_check (
    invoices_id int unique,
    nextcheck TIMESTAMP,
    FOREIGN KEY (invoices_id) REFERENCES invoices(id)
);
