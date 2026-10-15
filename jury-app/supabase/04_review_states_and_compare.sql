-- Shared Ground Jury App -- expanded vote states + "All Artwork" view
--
-- Adds two new ways for a juror to react to an artwork, on top of the
-- original Love/Skip:
--   - "reject"          -> shown to the juror as "Needs Improvement" / the
--                          "Rejected" tab. A hard no -- this artwork is out
--                          of the title race.
--   - "save_for_later"  -> the "Save for Later" tab. Distinct from "skip":
--                          a juror explicitly asked to come back to this
--                          one, rather than having passed it over.
-- "skip" keeps its original meaning (passed over, revisit eventually).
--
-- Also adds jury_all_artworks(), a new RPC backing the "All Artwork" tile
-- view -- every eligible submission in blind view, plus this juror's own
-- vote/comment on each one (so the UI can draw the right symbol on every
-- tile and support "my review" filtering), still never exposing
-- artist_name (blind review is preserved).
--
-- Run this ONCE in Supabase's SQL Editor, AFTER 01_schema_and_functions.sql
-- and 03_sheet_sync.sql have already been run. Safe to re-run (every
-- CREATE uses OR REPLACE; the constraint swap uses IF EXISTS).
--
-- IMPORTANT: this file re-creates jury_vote() and jury_review() one more
-- time, because 03_sheet_sync.sql's versions are the ones actually live
-- today (it runs after 01, and both use CREATE OR REPLACE, so whichever
-- file is run last wins). The jury_vote() below carries forward the exact
-- jury_sync_to_sheet(...) call from 03_sheet_sync.sql so the Google Sheet
-- mirror keeps working -- don't drop that call if you ever edit this
-- again.

-- ---------------------------------------------------------------------
-- 1. Widen the allowed vote values.
--
-- The column's check constraint was created inline in
-- 01_schema_and_functions.sql ("vote text not null check (vote in
-- ('love', 'skip'))"), which Postgres names <table>_<column>_check by
-- default -- i.e. votes_vote_check. Drop that and add the 4-state version.
alter table votes drop constraint if exists votes_vote_check;
alter table votes add constraint votes_vote_check
  check (vote in ('love', 'reject', 'save_for_later', 'skip'));

-- ---------------------------------------------------------------------
-- 2. jury_vote -- same as 03_sheet_sync.sql's version, widened whitelist.
create or replace function jury_vote(p_username text, p_password text, p_submission_id text, p_vote text, p_comment text default '')
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare u users;
begin
  u := jury_auth(p_username, p_password, 'juror');
  if u.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  if u.finalized then
    return jsonb_build_object('ok', false, 'error', 'Your votes are finalized. Ask an administrator to unlock your review to make changes.');
  end if;
  if p_vote not in ('love', 'reject', 'save_for_later', 'skip') then
    return jsonb_build_object('ok', false, 'error', 'bad_request');
  end if;
  if not exists (select 1 from submissions where id = p_submission_id) then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  insert into votes (juror_id, submission_id, vote, comment, updated_at)
  values (u.id, p_submission_id, p_vote, coalesce(p_comment, ''), now())
  on conflict (juror_id, submission_id)
  do update set vote = excluded.vote, comment = excluded.comment, updated_at = excluded.updated_at;

  perform jury_sync_to_sheet(jsonb_build_object(
    'type', 'vote',
    'secret', 'RgriRYQLSgG6v8ESBKd-2LFFeXJl2qSC',
    'jurorId', u.id,
    'submissionId', p_submission_id,
    'vote', p_vote,
    'comment', coalesce(p_comment, '')
  ));

  return jsonb_build_object('ok', true, 'saved', true, 'othersVotes', jury_others_votes(p_submission_id, u.id));
end;
$$;
grant execute on function jury_vote(text, text, text, text, text) to anon;

-- ---------------------------------------------------------------------
-- 3. jury_review -- now returns four categorized lists instead of two.
-- reviewsCompleted/reviewsRequired keep counting ALL vote types (same as
-- before), so jury_finalize's gate and the progress banner are unaffected.
create or replace function jury_review(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  u users;
  total int; completed int;
  loved jsonb; rejected jsonb; saved_for_later jsonb; skipped jsonb;
begin
  u := jury_auth(p_username, p_password, 'juror');
  if u.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select count(*) into total from submissions where eligible;
  select count(*) into completed from votes where juror_id = u.id;

  select coalesce(jsonb_agg(jsonb_build_object(
      'submissionId', v.submission_id, 'title', s.title, 'image', jury_image_json(s),
      'vote', v.vote, 'comment', v.comment
    ) order by s.title), '[]'::jsonb) into loved
    from votes v join submissions s on s.id = v.submission_id
    where v.juror_id = u.id and v.vote = 'love';

  select coalesce(jsonb_agg(jsonb_build_object(
      'submissionId', v.submission_id, 'title', s.title, 'image', jury_image_json(s),
      'vote', v.vote, 'comment', v.comment
    ) order by s.title), '[]'::jsonb) into rejected
    from votes v join submissions s on s.id = v.submission_id
    where v.juror_id = u.id and v.vote = 'reject';

  select coalesce(jsonb_agg(jsonb_build_object(
      'submissionId', v.submission_id, 'title', s.title, 'image', jury_image_json(s),
      'vote', v.vote, 'comment', v.comment
    ) order by s.title), '[]'::jsonb) into saved_for_later
    from votes v join submissions s on s.id = v.submission_id
    where v.juror_id = u.id and v.vote = 'save_for_later';

  select coalesce(jsonb_agg(jsonb_build_object(
      'submissionId', v.submission_id, 'title', s.title, 'image', jury_image_json(s),
      'vote', v.vote, 'comment', v.comment
    ) order by s.title), '[]'::jsonb) into skipped
    from votes v join submissions s on s.id = v.submission_id
    where v.juror_id = u.id and v.vote = 'skip';

  return jsonb_build_object(
    'ok', true, 'finalized', u.finalized, 'finalizedAt', u.finalized_at,
    'reviewsCompleted', completed, 'reviewsRequired', total,
    'loved', loved, 'rejected', rejected, 'savedForLater', saved_for_later, 'skipped', skipped
  );
end;
$$;
grant execute on function jury_review(text, text) to anon;

-- ---------------------------------------------------------------------
-- 4. jury_all_artworks -- every eligible submission in blind view, plus
-- this juror's own vote + comment on each (null/empty if not yet voted).
-- Backs the new "All Artwork" tile tab: tiles get a symbol from myVote,
-- and the tab's discipline/medium/"my review" filters all run client-side
-- against this one payload.
create or replace function jury_all_artworks(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  u users;
  items jsonb;
begin
  u := jury_auth(p_username, p_password, 'juror');
  if u.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', s.id, 'title', s.title, 'discipline', s.discipline, 'medium', s.medium,
      'statement', s.statement, 'image', jury_image_json(s),
      'myVote', v.vote, 'myComment', coalesce(v.comment, '')
    ) order by s.title), '[]'::jsonb) into items
  from submissions s
  left join votes v on v.submission_id = s.id and v.juror_id = u.id
  where s.eligible;

  return jsonb_build_object('ok', true, 'artworks', items);
end;
$$;
grant execute on function jury_all_artworks(text, text) to anon;
