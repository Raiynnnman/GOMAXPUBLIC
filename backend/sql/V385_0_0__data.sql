
use pain;

create table weather_run (
    id int primary key auto_increment,
    uuid varchar(64),
    city varchar(64),
    state varchar(10),
    timezone varchar(64),
    timezone_offset varchar(64),
    lat float not null default 0,
    lng float not null default 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
    
create table weather_run_current (
    id int primary key auto_increment,
    weather_run_id int,
    lat float not null default 0,
    lng float not null default 0,
    dt int,
    sunrise int,
    sunset int,
    temp float,
    feels_like float,
    pressure float,
    humidity float,
    dew_point float,
    uvi float,
    clouds int,
    visibility int,
    wind_speed float,
    wind_deg float,
    wind_gust float,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (weather_run_id) REFERENCES weather_run(id)
);

create table weather_run_current_weather (
    id int primary key auto_increment,
    weather_run_current_id int,
    main varchar(255),
    description varchar(255),
    icon varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (weather_run_current_id) REFERENCES weather_run_current(id)
);
    
create table weather_run_current_alerts(
    id int primary key auto_increment,
    weather_run_current_id int,
    sender varchar(255),
    event varchar(255),
    start_time int,
    end_time int,
    description mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (weather_run_current_id) REFERENCES weather_run_current(id)
);
