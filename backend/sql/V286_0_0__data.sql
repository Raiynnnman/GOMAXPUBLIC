use pain;
DROP PROCEDURE IF EXISTS import_qb_user;
DELIMITER $$
CREATE PROCEDURE import_qb_user(
  office_name varchar(255),
  email varchar(255),
  start_date varchar(255),
  pricing_data_id int,
  off_type int
)
  BEGIN
      /* Create the office */
      select 'office start';
      set @insert = CONCAT('insert into office (name,email,office_type_id,active) values (',office_name,',',email,',',off_type,',',1,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      select LAST_INSERT_ID() into @offid;
      /* Insert into provider queue */
      select 'prov start';
      set @insert = CONCAT('insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id) \
            values (',@offid,',',50,',',1,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      select 'Plans users start';
      /* Insert into users */
      set @insert = CONCAT('insert into users(email,active) values (',email,',',1,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      select LAST_INSERT_ID() into @userid;
      set @insert = CONCAT('insert into office_user(user_id,office_id) values (',@userid,',',@offid,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      select 'Plans ent start';
      /* Insert into entitlements */
      set @insert = CONCAT('insert into user_entitlements(user_id,entitlements_id) values (',@userid,',',7,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      select LAST_INSERT_ID() into @userid;
      set @insert = CONCAT('insert into user_entitlements(user_id,entitlements_id) values (',@userid,',',3,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      select LAST_INSERT_ID() into @userid;
      select 'Plans start';
      /* Insert into plans */
      select description into @descr from pricing_data where id=pricing_data_id;
      select upfront_cost into @upcost from pricing_data where id=pricing_data_id;
      set @insert = CONCAT('insert into office_plans \
            (office_id,pricing_data_id,start_date) values(',@offid,',',pricing_data_id,',',start_date,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      select 'op items start';
      select LAST_INSERT_ID() into @op_id;
      set @insert = concat('insert into office_plan_items(office_plans_id,description,price,quantity) \
            values (',@op_id,',''',@descr,''',',@upcost,',',1,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      /* insert into invoices */
      select 'invoices start';
      set @insert = CONCAT('insert into invoices \
            (office_id,billing_period,office_plans_id,invoice_status_id,dont_check) \
            values(',@offid,',',start_date,',',@op_id,',',15,',',1,')');
      select @insert;
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
      select LAST_INSERT_ID() into @inv_id;
      select 'invoice items start';
      set @insert = concat('insert into invoice_items(invoices_id,description,price,quantity) \
            values (',@inv_id,',''',@descr,''',',@upcost,',',1,')');
      PREPARE insert_q FROM @insert;
      EXECUTE insert_q;
  END $$
DELIMITER ;


