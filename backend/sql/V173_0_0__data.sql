
use pain;
select id into @v from users where email='christi@poundpain.com';
update office set commission_user_id=@v where active=1;
