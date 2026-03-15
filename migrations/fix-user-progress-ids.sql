-- Migration: Fix Progress User IDs
-- Problem: Progress was saved under old auth.users.id, but magic link uses users.id
-- Solution: Update user_progress and quiz_scores to use the new users.id
-- Run this in Supabase SQL Editor

-- Step 1: Check the data before migration (run this first to understand scope)
-- SELECT
--     'user_progress' as table_name,
--     COUNT(*) as total_rows,
--     COUNT(DISTINCT user_id) as unique_users
-- FROM user_progress
-- UNION ALL
-- SELECT
--     'quiz_scores' as table_name,
--     COUNT(*) as total_rows,
--     COUNT(DISTINCT user_id) as unique_users
-- FROM quiz_scores;

-- Step 2: Preview which users will be migrated
-- SELECT
--     au.id as old_auth_id,
--     u.id as new_user_id,
--     au.email,
--     (SELECT COUNT(*) FROM user_progress WHERE user_id = au.id::text) as progress_rows,
--     (SELECT COUNT(*) FROM quiz_scores WHERE user_id = au.id::text) as quiz_rows
-- FROM auth.users au
-- JOIN users u ON LOWER(au.email) = LOWER(u.email)
-- WHERE EXISTS (SELECT 1 FROM user_progress WHERE user_id = au.id::text)
--    OR EXISTS (SELECT 1 FROM quiz_scores WHERE user_id = au.id::text);

-- Step 3: Run the actual migration (uncomment to execute)

-- Migrate user_progress table
UPDATE user_progress up
SET user_id = u.id
FROM auth.users au
JOIN users u ON LOWER(au.email) = LOWER(u.email)
WHERE up.user_id = au.id::text
  AND up.user_id != u.id;

-- Migrate quiz_scores table
UPDATE quiz_scores qs
SET user_id = u.id
FROM auth.users au
JOIN users u ON LOWER(au.email) = LOWER(u.email)
WHERE qs.user_id = au.id::text
  AND qs.user_id != u.id;

-- Step 4: Verify the migration worked
SELECT
    'user_progress' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN user_id IN (SELECT id FROM users) THEN 1 END) as matched_to_new_users
FROM user_progress
UNION ALL
SELECT
    'quiz_scores' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN user_id IN (SELECT id FROM users) THEN 1 END) as matched_to_new_users
FROM quiz_scores;
