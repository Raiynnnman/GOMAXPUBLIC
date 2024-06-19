
use pain;
create table user_upload_email (
    id int primary key auto_increment,
    email varchar(255),
    user_id int,
    office_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

create table user_upload_documents (
    id int primary key auto_increment,
    user_upload_email_id int,
    description varchar(255),
    mimetype varchar(64),
    blob_path varchar(512),
    FOREIGN KEY (user_upload_email_id) REFERENCES user_upload_email(id),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
