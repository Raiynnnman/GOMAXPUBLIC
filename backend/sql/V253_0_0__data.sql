
alter table office add column (
    priority int not null default 0
);

alter table invoices add column (dont_check int not null default 0);

/* Dont check any current invoice */
update invoices set dont_check = 1;
update office set stripe_cust_id = null;
delete from office_cards;
