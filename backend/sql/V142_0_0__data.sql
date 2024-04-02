
use pain;
alter table performance add column (ms2 float);
update performance set ms2=ms;
alter table performance drop ms;
alter table performance add column (ms float);
update performance set ms=ms2;
alter table performance drop ms2;
