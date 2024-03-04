use pain;

DROP FUNCTION IF EXISTS column_exists;

DELIMITER $$
CREATE FUNCTION column_exists(
  tname VARCHAR(64),
  cname VARCHAR(64)
)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    RETURN 0 < (SELECT COUNT(*)
                FROM `INFORMATION_SCHEMA`.`COLUMNS`
                WHERE `TABLE_SCHEMA` = SCHEMA()
                      AND `TABLE_NAME` = tname
                      AND `COLUMN_NAME` = cname);
  END $$
DELIMITER ;

-- drop_column_if_exists:

DROP PROCEDURE IF EXISTS drop_column_if_exists;

DELIMITER $$
CREATE PROCEDURE drop_column_if_exists(
  tname VARCHAR(64),
  cname VARCHAR(64)
)
  BEGIN
    IF column_exists(tname, cname)
    THEN
      SET @drop_column_if_exists = CONCAT('ALTER TABLE `', tname, '` DROP COLUMN `', cname, '`');
      PREPARE drop_query FROM @drop_column_if_exists;
      EXECUTE drop_query;
    END IF;
  END $$
DELIMITER ;


CALL drop_column_if_exists('','updated');
CALL drop_column_if_exists('api_errors','updated');
CALL drop_column_if_exists('appt_scheduled','updated');
CALL drop_column_if_exists('appt_status','updated');
CALL drop_column_if_exists('audit_list','updated');
CALL drop_column_if_exists('company','updated');
CALL drop_column_if_exists('context','updated');
CALL drop_column_if_exists('entitlements','updated');
CALL drop_column_if_exists('errorlog','updated');
CALL drop_column_if_exists('invoice_history','updated');
CALL drop_column_if_exists('invoice_items','updated');
CALL drop_column_if_exists('invoice_status','updated');
CALL drop_column_if_exists('invoices','updated');
CALL drop_column_if_exists('invoices_comment','updated');
CALL drop_column_if_exists('ip_lookup','updated');
CALL drop_column_if_exists('job_status_history','updated');
CALL drop_column_if_exists('joblog','updated');
CALL drop_column_if_exists('jobs','updated');
CALL drop_column_if_exists('login_attempts','updated');
CALL drop_column_if_exists('office','updated');
CALL drop_column_if_exists('office_addresses','updated');
CALL drop_column_if_exists('office_cards','updated');
CALL drop_column_if_exists('office_plan_items','updated');
CALL drop_column_if_exists('office_plans','updated');
CALL drop_column_if_exists('office_type','updated');
CALL drop_column_if_exists('office_type_descriptions','updated');
CALL drop_column_if_exists('office_user','updated');
CALL drop_column_if_exists('performance','updated');
CALL drop_column_if_exists('permissions','updated');
CALL drop_column_if_exists('physician_about','updated');
CALL drop_column_if_exists('physician_appt_comments','updated');
CALL drop_column_if_exists('physician_media','updated');
CALL drop_column_if_exists('physician_schedule','updated');
CALL drop_column_if_exists('physician_schedule_config','updated');
CALL drop_column_if_exists('physician_schedule_scheduled','updated');
CALL drop_column_if_exists('position_zip','updated');
CALL drop_column_if_exists('pricing_data','updated');
CALL drop_column_if_exists('products','updated');
CALL drop_column_if_exists('provider_queue','updated');
CALL drop_column_if_exists('provider_queue_status','updated');
CALL drop_column_if_exists('ratings','updated');
CALL drop_column_if_exists('registration_types','updated');
CALL drop_column_if_exists('registrations','updated');
CALL drop_column_if_exists('registrations_tokens','updated');
CALL drop_column_if_exists('setupIntents','updated');
CALL drop_column_if_exists('status','updated');
CALL drop_column_if_exists('stripe_invoice_status','updated');
CALL drop_column_if_exists('stripe_status','updated');
CALL drop_column_if_exists('timezones','updated');
CALL drop_column_if_exists('traffic_categories','updated');
CALL drop_column_if_exists('traffic_cities','updated');
CALL drop_column_if_exists('traffic_coordinates','updated');
CALL drop_column_if_exists('traffic_incidents','updated');
CALL drop_column_if_exists('traffic_poll_attempt','updated');
CALL drop_column_if_exists('traffic_road_numbers','updated');
CALL drop_column_if_exists('traffic_zipcodes','updated');
CALL drop_column_if_exists('user_cards','updated');
CALL drop_column_if_exists('user_entitlements','updated');
CALL drop_column_if_exists('user_login_tokens','updated');
CALL drop_column_if_exists('user_permissions','updated');
CALL drop_column_if_exists('user_products','updated');
CALL drop_column_if_exists('users','updated');
CALL drop_column_if_exists('users_passwords','updated');
CALL drop_column_if_exists('visits','updated');

/* ----- */
alter table api_errors                   add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table appt_scheduled               add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table appt_status                  add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table audit_list                   add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table company                      add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table context                      add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table entitlements                 add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table errorlog                     add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table invoice_history              add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table invoice_items                add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table invoice_status               add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table invoices                     add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table invoices_comment             add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table ip_lookup                    add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table job_status_history           add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table joblog                       add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table jobs                         add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table login_attempts               add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table office                       add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table office_addresses             add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table office_cards                 add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table office_plan_items            add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table office_plans                 add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table office_type                  add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table office_type_descriptions     add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table office_user                  add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table performance                  add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table permissions                  add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table physician_about              add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table physician_appt_comments      add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table physician_media              add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table physician_schedule           add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table physician_schedule_config    add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table physician_schedule_scheduled add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table position_zip                 add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table pricing_data                 add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table products                     add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table provider_queue               add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table provider_queue_status        add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table ratings                      add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table registration_types           add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table registrations                add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table registrations_tokens         add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table setupIntents                 add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table status                       add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table stripe_invoice_status        add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table stripe_status                add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table timezones                    add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table traffic_categories           add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table traffic_cities               add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table traffic_coordinates          add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table traffic_incidents            add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table traffic_poll_attempt         add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table traffic_road_numbers         add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table traffic_zipcodes             add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table user_cards                   add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table user_entitlements            add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table user_login_tokens            add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table user_permissions             add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table user_products                add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table users                        add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table users_passwords              add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
alter table visits                       add column (updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
