
use pain;

update salesforce_mapping set sf_field_name = 'Provider type' where sf_field_name='Provider_type__c';
update salesforce_mapping set sf_field_name = 'Original Subscribtion Date' where sf_field_name='Original_Subscription_Date__c';
update salesforce_mapping set sf_field_name = 'Payment Term' where sf_field_name='PaymentTerm';
update salesforce_mapping set sf_field_name = 'Payment Amount' where sf_field_name='PaymentAmount';
update salesforce_mapping set sf_field_name = 'Package Type' where sf_field_name='Package Type';
delete from salesforce_mapping where sf_field_name='ConvertedDate';
delete from salesforce_mapping where sf_field_name='CreatedDate';
