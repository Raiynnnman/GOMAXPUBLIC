
use pain;
DROP PROCEDURE IF EXISTS delete_invoice;

DELIMITER $$
CREATE PROCEDURE delete_invoice(
    inv_id int
)
    BEGIN
        delete from invoice_history where invoices_id=inv_id;
        delete from invoices_comment where invoices_id=inv_id;
        delete from invoice_check where invoices_id=inv_id;
        delete from invoice_items where invoices_id=inv_id;
        delete from stripe_invoice_status where invoices_id=inv_id;
        delete from invoices where id=inv_id;
    END $$
DELIMITER ;
        
