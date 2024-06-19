use pain;

DROP PROCEDURE IF EXISTS delchat;

DELIMITER $$
CREATE PROCEDURE delchat(
  id int
)
  BEGIN
      SET @delete_data = CONCAT('delete from chat_room_invited where chat_rooms_id=', id);
      PREPARE drop_query FROM @delete_data;
      EXECUTE drop_query;
      SET @delete_data = CONCAT('delete from chat_room_discussions where chat_rooms_id=', id);
      PREPARE drop_query FROM @delete_data;
      EXECUTE drop_query;
      SET @delete_data = CONCAT('delete from chat_rooms where id=', id);
      PREPARE drop_query FROM @delete_data;
      EXECUTE drop_query;
  END $$
DELIMITER ;


