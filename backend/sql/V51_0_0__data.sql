
use pain;
create table invoice_history (
    id int primary key auto_increment,
    user_id int,
    invoices_id int,
    text varchar(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (invoices_id) REFERENCES invoices(id)
);
