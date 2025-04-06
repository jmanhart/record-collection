-- This script will restore the sequential IDs starting from 502
-- Only run this if you need to rollback the previous migration

-- Step 1: Create a temporary table to store current IDs
CREATE TEMP TABLE records_to_rollback AS
SELECT id as current_id, title
FROM records
WHERE id > 100000  -- This assumes all Discogs release_ids are large numbers
ORDER BY created_at;

-- Step 2: Create a function to handle the rollback
CREATE OR REPLACE FUNCTION rollback_record_ids() RETURNS void AS $$
DECLARE
    r RECORD;
    next_id INTEGER := 502;  -- Starting from 502 as in the original sequence
BEGIN
    -- For each record that needs updating
    FOR r IN SELECT * FROM records_to_rollback LOOP
        -- Update the record's id back to a sequential number
        UPDATE records
        SET id = next_id
        WHERE id = r.current_id;
        
        RAISE NOTICE 'Rolled back record: % (ID: % → %)', r.title, r.current_id, next_id;
        
        next_id := next_id + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Begin the transaction
BEGIN;

-- Step 4: Run the rollback
SELECT rollback_record_ids();

-- Step 5: Clean up
DROP FUNCTION rollback_record_ids();
DROP TABLE records_to_rollback;

-- Step 6: Commit the transaction
COMMIT;

-- Note: If something goes wrong, the transaction will automatically rollback 