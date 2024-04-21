
use pain;
create table provider_queue_sf_updated(
    provider_queue_id int unique,
    modified timestamp
);

alter table provider_queue drop sf_updated;
