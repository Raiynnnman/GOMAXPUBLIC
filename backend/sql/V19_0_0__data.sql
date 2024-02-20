

CREATE TABLE if not exists invoice_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name varchar(255)
);

insert into invoice_status (id,name) values (1,'CREATED');
insert into invoice_status (id,name) values (5,'APPROVED');
insert into invoice_status (id,name) values (7,'GENERATED');
insert into invoice_status (id,name) values (10,'SENT');
insert into invoice_status (id,name) values (15,'PAID');
insert into invoice_status (id,name) values (20,'DISPUTED');
insert into invoice_status (id,name) values (25,'ERROR');

create table if not exists invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  office_id int,
  user_id int,
  physician_schedule_id int,
  stripe_invoice_id varchar(255) unique,
  nextcheck TIMESTAMP,
  due DATE,
  invoice_status_id int,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (office_id) REFERENCES office(id),
  FOREIGN KEY (invoice_status_id) REFERENCES invoice_status(id),
  FOREIGN KEY (physician_schedule_id) REFERENCES physician_schedule(id)
);

create table if not exists invoice_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoices_id int,
  description varchar(255),
  price float,
  code varchar(255),
  quantity int,
  fee float,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoices_id) REFERENCES invoices(id)

);

CREATE TABLE if not exists stripe_invoice_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  office_id int,
  invoices_id int,
  stripe_invoice_id varchar(255) unique,
  amount_due int,
  amount_paid int,
  amount_remaining int,
  attempt_count int,
  next_payment_attempt int,
  status varchar(25),
  finalized_at int,
  paid_at int,
  voided_at int,
  marked_uncollectable_at int,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoices_id) REFERENCES invoices(id)
);

CREATE TABLE if not exists user_cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id int,
  card_id varchar(255),
  payment_id varchar(255),
  last4 varchar(10),
  nextcheck TIMESTAMP,
  exp_month int,
  exp_year int,
  is_default int not null default 0,
  funding varchar(255),
  name varchar(255),
  brand varchar(255),
  address1 varchar(255),
  address2 varchar(255),
  state varchar(255),
  city varchar(255),
  zip varchar(255),
  is_active int not null default 1,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


alter table invoices drop column due;
alter table stripe_invoice_status add column (
    invoice_pay_url varchar(255),
    invoice_pdf_url varchar(255),
    due DATE,
    stripe_invoice_number varchar(255) unique
);
alter table legal add column (stripe_cust_id varchar(255));
alter table office add column (stripe_cust_id varchar(255));
create table stripe_status (
    balance float not null default 0,
    connect_reserved float not null default 0,
    fees_this_month float not null default 0,
    count_inv_this_month int not null default 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
