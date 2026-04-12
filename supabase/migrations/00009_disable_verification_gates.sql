-- ============================================================
-- Migration 00009: Disable verification gates for testing
--
-- TODO(launch): Re-enable these gates before going live.
-- To re-enable, drop this migration and restore the triggers
-- from 00008_tutor_verification.sql, or create a new migration
-- that re-creates them.
-- ============================================================

-- Drop session booking guard
drop trigger if exists trg_block_unverified_session on public.sessions;
drop function if exists public.block_unverified_tutor_session();

-- Drop request booking guard
drop trigger if exists trg_block_unverified_request on public.requests;
drop function if exists public.block_unverified_tutor_request();
