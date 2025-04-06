-- First create a backup of the records table just in case
CREATE TABLE IF NOT EXISTS records_backup_20240318 AS
SELECT * FROM records;

-- Create a temporary table to track updates
CREATE TEMP TABLE records_to_update AS
SELECT id as old_id, release_id as new_id, title
FROM records
WHERE id != release_id;

-- Update the records one by one to avoid conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM records_to_update ORDER BY old_id LOOP
        -- Update the record's id to match its release_id
        UPDATE records
        SET id = r.new_id
        WHERE id = r.old_id;
    END LOOP;
END $$;

-- Clean up
DROP TABLE records_to_update; 