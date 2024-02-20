
use pain;

create table login_attempts(
    user_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
    
