
use pain;

create table if not exists appt_scheduled (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id int,
  cust_id int,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cust_id) REFERENCES users(id)
);
