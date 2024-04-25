
use pain;
create table landing_configuration (
    id int primary key auto_increment,
    url varchar(255),
    active int not null default 0,
    slot int not null default 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into landing_configuration (url,active,slot) values 
(
    'https://player.vimeo.com/video/939097958?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    1,0
),
(
    'https://calendly.com/d/ck2s-xvq-t7n/poundpain-introduction',
    1,1
);
