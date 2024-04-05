
use pain;
update office_addresses oa,office o set oa.name=o.name where o.id=oa.office_id and oa.name is null;
