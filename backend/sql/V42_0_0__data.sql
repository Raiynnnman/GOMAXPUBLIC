
use pain;

CREATE TABLE if not exists office_cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  office_id int,
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
  client_ip varchar(64),
  address1 varchar(255),
  address2 varchar(255),
  state varchar(255),
  city varchar(255),
  zip varchar(255),
  is_active int not null default 1,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (office_id) REFERENCES office(id)
);
