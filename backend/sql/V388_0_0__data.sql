
use pain;
update provider_queue pq inner join office_plans op on pq.office_id = op.office_id set pq.closed_date=op.start_date;
