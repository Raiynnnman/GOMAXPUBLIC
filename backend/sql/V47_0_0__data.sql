
use pain;

alter table office_type_descriptions add column (signup_description varchar(255));

update office_type_descriptions set signup_description = 'I am a Chiropractor' where office_type_id = 1;
update office_type_descriptions set signup_description = 'I provide Legal Counsel' where office_type_id = 2;
update office_type_descriptions set signup_description = 'I would like to find services' where office_type_id = 3;
