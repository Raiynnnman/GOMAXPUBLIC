use pain;
create table api_errors(
    id int primary key auto_increment,
    request_path varchar(255),
    request_value mediumtext,
    stack mediumtext,
    error mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
