
use pain;
insert into office_providers (office_addresses_id,user_id)
    select oa.id,ou.user_id from office_user ou, office_addresses oa, office o
where oa.office_id=o.id and o.office_type_id=1 and ou.office_id=o.id;
