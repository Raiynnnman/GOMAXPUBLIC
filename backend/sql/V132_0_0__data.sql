
use pain;
insert into user_entitlements (user_id,entitlements_id) 
    select ou.user_id,7 from office_user ou,office o where o.id=ou.office_id and office_type_id=1;
