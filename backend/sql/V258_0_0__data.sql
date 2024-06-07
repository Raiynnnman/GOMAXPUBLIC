
use pain;
update pricing_data_benefits set description=substr(description,3) where locate('- ',description) > 0;
