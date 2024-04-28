
use pain;
create table office_providers (
    id int primary key auto_increment,
    office_addresses_id int,
    user_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (office_addresses_id) REFERENCES office_addresses(id)
);

rename table physician_about to office_provider_about;
rename table physician_media to office_provider_media;
