-- Migration 0004: Clean up orphaned check_in_sessions whose period has been soft-deleted

-- 1. Null tasks.minutes_id for tasks tied to orphaned sessions' minutes
UPDATE tasks SET minutes_id = NULL
WHERE minutes_id IN (
  SELECT sm.id FROM session_minutes sm
  INNER JOIN check_in_sessions cs ON sm.session_id = cs.id
  INNER JOIN okr_periods p ON cs.period_id = p.id
  WHERE p.deleted_at IS NOT NULL
);

-- 2. Delete session_minutes for orphaned sessions
DELETE FROM session_minutes
WHERE session_id IN (
  SELECT cs.id FROM check_in_sessions cs
  INNER JOIN okr_periods p ON cs.period_id = p.id
  WHERE p.deleted_at IS NOT NULL
);

-- 3. Null check_ins.session_id for orphaned sessions
UPDATE check_ins SET session_id = NULL
WHERE session_id IN (
  SELECT cs.id FROM check_in_sessions cs
  INNER JOIN okr_periods p ON cs.period_id = p.id
  WHERE p.deleted_at IS NOT NULL
);

-- 4. Delete orphaned sessions
DELETE FROM check_in_sessions
WHERE period_id IN (
  SELECT id FROM okr_periods WHERE deleted_at IS NOT NULL
);
