
use pain;
create table if not exists traffic_categories(
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id int, 
  name varchar(255)
);
insert into traffic_categories (category_id, name) values 
(0, "Unknown"),
(1, "Accident"),
(2, "Fog"),
(3, "DangerousConditions"),
(4, "Rain"),
(5, "Ice"),
(6, "Jam"),
(7, "LaneClosed"),
(8, "RoadClosed"),
(9, "RoadWorks"),
(10, "Wind"),
(11, "Flooding"),
(14, "BrokenDownVehicle");

create table traffic_poll_attempt (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid varchar(64) unique
);

create table traffic_incidents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  traffic_poll_attempt_id int,
  uuid varchar(64) unique,
  vendor_id varchar(255),
  probability varchar(255),
  city varchar(255),
  zipcode varchar(25),
  lat float,
  lon float,
  traf_from varchar(255),
  traf_to varchar(255),
  traf_len float,
  traf_magnitude int,
  traf_start_time TIMESTAMP,
  traf_end_time TIMESTAMP,
  traf_delay varchar(255),
  traf_num_reports int not null default 0,
  traffic_categories_id int,
  feature_type varchar(255),
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (traffic_poll_attempt_id) REFERENCES traffic_poll_attempt(id),
  FOREIGN KEY (traffic_categories_id) REFERENCES traffic_categories(id)
);

create table traffic_road_numbers(
  id INT PRIMARY KEY AUTO_INCREMENT,
  traffic_incidents_id int,
  road_name varchar(255),
  FOREIGN KEY (traffic_incidents_id) REFERENCES traffic_incidents(id)
);

create table traffic_coordinates(
  id INT PRIMARY KEY AUTO_INCREMENT,
  traffic_incidents_id int,
  lat float not null default 0,
  lon float not null default 0,
  ord int not null default 0,
  FOREIGN KEY (traffic_incidents_id) REFERENCES traffic_incidents(id)
);



