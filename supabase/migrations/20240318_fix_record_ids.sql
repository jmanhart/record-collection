-- Step 1: Create a temporary table to store the records we need to update
CREATE TEMP TABLE records_to_update AS
SELECT id as old_id, release_id as new_id, title
FROM records
WHERE id != release_id;

-- Step 2: Create a function to handle the migration
CREATE OR REPLACE FUNCTION migrate_record_ids() RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- For each record that needs updating
    FOR r IN SELECT * FROM records_to_update LOOP
        -- Update foreign key references in other tables (if any exist)
        -- Add more tables here if needed
        
        -- Update the record's id to match its release_id
        UPDATE records
        SET id = r.new_id
        WHERE id = r.old_id;
        
        RAISE NOTICE 'Updated record: % (ID: % → %)', r.title, r.old_id, r.new_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Begin the transaction
BEGIN;

-- Step 4: Run the migration
SELECT migrate_record_ids();

-- Step 5: Clean up
DROP FUNCTION migrate_record_ids();
DROP TABLE records_to_update;

-- Step 6: Commit the transaction
COMMIT;

-- Note: If something goes wrong, the transaction will automatically rollback 