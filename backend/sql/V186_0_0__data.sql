
alter table provider_queue drop column sf_executed; 
alter table provider_queue add column (sf_lead_executed int not null default 0);
