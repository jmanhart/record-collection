-- Restore from backup
TRUNCATE TABLE records;
INSERT INTO records SELECT * FROM records_backup_20240318;

-- Clean up backup
DROP TABLE records_backup_20240318; 