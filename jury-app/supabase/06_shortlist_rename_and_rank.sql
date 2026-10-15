-- Shared Ground Jury App -- Shortlist rename, Skip removal, dimensions,
-- public Comments feed, comment-before-decision rule, and weighted ranking
--
-- This file folds in the next round of jury-app changes:
--
--   1. "Love" is renamed to "Shortlist" everywhere a juror or admin sees it
--      ("Loved" -> "Shortlisted"). The underlying vote VALUE stored in the
--      votes table stays 'love' -- only display labels change in the
--      frontend (admin.js / juror.js), both to limit the blast radius of
--      this change and because jury_sync_to_sheet (03_sheet_sync.sql)
--      still sends the raw 'love' value straight through to the Apps
--      Script Google Sheet mirror, which would also need updating if the
--      stored value itself changed.
--
--   2. The "Skip" vote state is retired. Historical 'skip' rows are left
--      in the votes table untouched (nothing is deleted -- the Sheet's
--      Votes tab mirror and this table both keep a full audit trail), but
--      from here on:
--        - jury_vote() refuses any new/changed vote of 'skip'.
--        - every juror-facing and dashboard-aggregate function now treats
--          an existing 'skip' row as if it doesn't exist (filtered out at
--          the join), so a submission a juror skipped a long time ago
--          simply looks "not yet reviewed" again everywhere -- on their
--          queue, their progress count, the admin dashboard aggregates,
--          the public Comments feed, and the CSV export. They naturally
--          get asked to give it a real reaction (Shortlist / Reject /
--          Save for Later) the next time it comes up.
--        - the ONE exception is jury_admin_submission_detail(), left
--          exactly as it was (not filtered) -- it's the admin's one
--          drill-into-a-single-submission audit view, so a historical
--          skip still shows up there, labeled by the frontend as a
--          legacy state, instead of silently vanishing from the record.
--      The votes_vote_check constraint itself is deliberately NOT
--      tightened to drop 'skip' from the allowed list -- doing that would
--      require every existing 'skip' row to be deleted or converted first
--      (Postgres validates CHECK constraints against existing data), which
--      this file does not do. The constraint stays permissive; jury_vote()
--      is what actually enforces "no new skips" at the application layer.
--
--   3. Comments stay fully optional on every vote state (love / reject /
--      save_for_later) -- there is no server-side or client-side
--      requirement to add one before saving a decision. A juror can leave
--      a comment before marking an artwork, or come back and add/edit one
--      later from that artwork's dedicated tab (Shortlisted / Rejected /
--      Saved for Later).
--
--   4. jury_blind_view() and jury_all_artworks() now also return each
--      submission's `dimensions` (already collected at intake, but never
--      surfaced to jurors before this) alongside discipline/medium/
--      statement.
--
--   5. A new jury_comments() RPC backs a juror-facing "Comments" tab: every
--      non-empty comment any juror has left, across all submissions,
--      newest first. It is NOT admin-gated -- any authenticated juror can
--      call it, same trust level as jury_review().
--
--   6. The Top 20 ranking on the admin dashboard changes from "Love count
--      only" to a weighted score per submission:
--        Shortlist = +1, Save for Later = +0.1, Reject = -0.1, not yet
--        reviewed = 0 (no row at all, contributes nothing).
--      This score is purely a backend sort key -- it is never included in
--      any RPC's JSON output, matching the request that it stay invisible.
--      jury_admin_results, jury_admin_submissions, and
--      jury_admin_export_rows all switch their ORDER BY / tie-detection
--      from love_count to this score. skipCount/total_skip are dropped
--      from all three (Skip no longer exists as a trackable state).
--
-- Run this ONCE in Supabase's SQL Editor, AFTER 01_schema_and_functions.sql,
-- 03_sheet_sync.sql, 04_review_states_and_compare.sql, and
-- 05_admin_review_states.sql have already been run. Safe to re-run (every
-- CREATE uses OR REPLACE; the one DROP FUNCTION IF EXISTS call is a no-op
-- after the first run).
--
-- Supabase's SQL Editor will show its usual "destructive operations"
-- warning dialog because of the DROP FUNCTION statement below -- same as
-- when 05_admin_review_states.sql was run. It's expected and safe for the
-- same reason: the DROP is immediately followed by its CREATE OR REPLACE,
-- which recreates the function (with the column list it needs now) before
-- anything else touches it. Go ahead and click "Run query".

-- ---------------------------------------------------------------------
-- 1. jury_blind_view -- add dimensions (juror-facing, still never exposes
-- artist_name -- blind review is preserved).
create or replace function jury_blind_view(s submissions)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'id', s.id, 'title', s.title, 'discipline', s.discipline, 'medium', s.medium,
    'dimensions', s.dimensions, 'statement', s.statement, 'image', jury_image_json(s)
  );
$$;

-- ---------------------------------------------------------------------
-- 2. jury_others_votes -- a stale 'skip' now shows as "not yet reviewed"
-- for that other juror, same as everywhere else.
create or replace function jury_others_votes(p_submission_id text, p_excluding_juror_id text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'jurorId', j.id, 'jurorName', j.name, 'vote', v.vote
  ) order by j.name), '[]'::jsonb)
  from users j
  left join votes v on v.juror_id = j.id and v.submission_id = p_submission_id and v.vote <> 'skip'
  where j.role = 'juror' and j.id <> p_excluding_juror_id;
$$;

-- ---------------------------------------------------------------------
-- 3. jury_submission -- a juror's own stale 'skip' now reads as "no vote
-- yet", sending them back to the full fresh-evaluation view for it.
create or replace function jury_submission(p_username text, p_password text, p_id text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  u users;
  s submissions;
  my_vote votes;
  others jsonb := '[]'::jsonb;
begin
  u := jury_auth(p_username, p_password, 'juror');
  if u.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select * into s from submissions where id = p_id;
  if s.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;

  select * into my_vote from votes where juror_id = u.id and submission_id = p_id and vote <> 'skip';
  if my_vote.id is not null then
    others := jury_others_votes(p_id, u.id);
  end if;

  return jsonb_build_object(
    'ok', true, 'submission', jury_blind_view(s),
    'myVote', case when my_vote.id is not null then jsonb_build_object('vote', my_vote.vote, 'comment', my_vote.comment) else null end,
    'othersVotes', others
  );
end;
$$;
grant execute on function jury_submission(text, text, text) to anon;

-- ---------------------------------------------------------------------
-- 4. jury_vote -- no more 'skip' as a valid new vote. Comments remain
-- fully optional on every vote. Carries forward the jury_sync_to_sheet(...)
-- call from 03_sheet_sync.sql so the Google Sheet mirror keeps working.
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
  if p_vote not in ('love', 'reject', 'save_for_later') then
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
-- 5. jury_review -- no more 'skipped' list; reviewsCompleted/the finalize
-- gate no longer count a stale 'skip' as reviewed.
create or replace function jury_review(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  u users;
  total int; completed int;
  loved jsonb; rejected jsonb; saved_for_later jsonb;
begin
  u := jury_auth(p_username, p_password, 'juror');
  if u.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select count(*) into total from submissions where eligible;
  select count(*) into completed from votes where juror_id = u.id and vote <> 'skip';

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

  return jsonb_build_object(
    'ok', true, 'finalized', u.finalized, 'finalizedAt', u.finalized_at,
    'reviewsCompleted', completed, 'reviewsRequired', total,
    'loved', loved, 'rejected', rejected, 'savedForLater', saved_for_later
  );
end;
$$;
grant execute on function jury_review(text, text) to anon;

-- ---------------------------------------------------------------------
-- 6. jury_finalize -- a stale 'skip' no longer counts as "already
-- reacted to", so finalizing now requires a real reaction to it too.
create or replace function jury_finalize(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare u users; missing int;
begin
  u := jury_auth(p_username, p_password, 'juror');
  if u.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select count(*) into missing from submissions s
    where s.eligible and not exists (
      select 1 from votes v where v.juror_id = u.id and v.submission_id = s.id and v.vote <> 'skip'
    );
  if missing > 0 then
    return jsonb_build_object('ok', false, 'error', 'You still have ' || missing || ' artwork(s) to react to before finalizing.');
  end if;

  update users set finalized = true, finalized_at = now() where id = u.id;
  return jsonb_build_object('ok', true, 'finalized', true);
end;
$$;
grant execute on function jury_finalize(text, text) to anon;

-- ---------------------------------------------------------------------
-- 7. jury_all_artworks -- add dimensions; a stale 'skip' reads as no vote.
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
      'dimensions', s.dimensions, 'statement', s.statement, 'image', jury_image_json(s),
      'myVote', v.vote, 'myComment', coalesce(v.comment, '')
    ) order by s.title), '[]'::jsonb) into items
  from submissions s
  left join votes v on v.submission_id = s.id and v.juror_id = u.id and v.vote <> 'skip'
  where s.eligible;

  return jsonb_build_object('ok', true, 'artworks', items);
end;
$$;
grant execute on function jury_all_artworks(text, text) to anon;

-- ---------------------------------------------------------------------
-- 8. jury_comments -- NEW. Backs the juror-facing "Comments" tab: every
-- non-empty comment any juror has left, across all submissions, newest
-- first. Any authenticated juror can call this (not admin-gated) -- same
-- trust level as jury_review().
create or replace function jury_comments(p_username text, p_password text)
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
      'submissionId', v.submission_id, 'title', s.title, 'jurorId', j.id, 'jurorName', j.name,
      'vote', v.vote, 'comment', v.comment, 'updatedAt', v.updated_at
    ) order by v.updated_at desc), '[]'::jsonb) into items
  from votes v
  join submissions s on s.id = v.submission_id
  join users j on j.id = v.juror_id
  where v.comment <> '' and v.vote <> 'skip';

  return jsonb_build_object('ok', true, 'comments', items);
end;
$$;
grant execute on function jury_comments(text, text) to anon;

-- ---------------------------------------------------------------------
-- 9. jury_admin_overview -- a stale 'skip' no longer counts toward the
-- global reviews-completed tally.
create or replace function jury_admin_overview(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  a users;
  total_subs int; elig_subs int; jcount int; req int; comp int;
  jurors_json jsonb;
begin
  a := jury_auth(p_username, p_password, 'admin');
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select count(*) into total_subs from submissions;
  select count(*) into elig_subs from submissions where eligible;
  select count(*) into jcount from users where role = 'juror';
  req := elig_subs * jcount;
  select count(*) into comp from votes where vote <> 'skip';

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', j.id, 'name', j.name,
    'completed', (select count(*) from votes v where v.juror_id = j.id and v.vote <> 'skip'),
    'required', elig_subs, 'finalized', j.finalized
  ) order by j.name), '[]'::jsonb) into jurors_json
  from users j where j.role = 'juror';

  return jsonb_build_object(
    'ok', true, 'totalSubmissions', total_subs, 'eligibleSubmissions', elig_subs,
    'jurorCount', jcount, 'totalReviewsRequired', req, 'reviewsCompleted', comp,
    'reviewsRemaining', req - comp,
    'percentComplete', case when req = 0 then 0 else round((comp::numeric / req) * 100, 1)::float8 end,
    'jurors', jurors_json
  );
end;
$$;
grant execute on function jury_admin_overview(text, text) to anon;

-- ---------------------------------------------------------------------
-- 10. jury_admin_results -- Top 20 ranking switches from love-count-only
-- to a weighted score (Shortlist +1, Save for Later +0.1, Reject -0.1).
-- The score itself is never put into any jsonb output -- it only ever
-- drives ORDER BY / tie detection, both here and in the two functions
-- below. skipCount is dropped (Skip no longer exists as a trackable
-- state); a stale 'skip' is filtered out of every count via the join.
create or replace function jury_admin_results(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  a users;
  jcount int;
  jurors_json jsonb;
  ranked jsonb;
  unranked jsonb;
  tie_flag jsonb := null;
  rank20_score numeric; rank21_score numeric;
  tied_rank int; tied_ids text[];
begin
  a := jury_auth(p_username, p_password, 'admin');
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select count(*) into jcount from users where role = 'juror';
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name) order by name), '[]'::jsonb)
    into jurors_json from users where role = 'juror';

  with per_sub as (
    select s.id, s.title, s.eligible,
      count(v.id) as reviews_completed,
      count(*) filter (where v.vote = 'love') as love_count,
      count(*) filter (where v.vote = 'reject') as reject_count,
      count(*) filter (where v.vote = 'save_for_later') as save_for_later_count,
      (count(*) filter (where v.vote = 'love'))::numeric * 1
        + (count(*) filter (where v.vote = 'save_for_later'))::numeric * 0.1
        + (count(*) filter (where v.vote = 'reject'))::numeric * -0.1 as score,
      coalesce(jsonb_object_agg(j.id, v.vote) filter (where j.id is not null), '{}'::jsonb) as by_juror
    from submissions s
    left join users j on j.role = 'juror'
    left join votes v on v.submission_id = s.id and v.juror_id = j.id and v.vote <> 'skip'
    group by s.id, s.title, s.eligible
  ),
  ranked_cte as (
    -- Competition ("1224") ranking: submissions tied on score share the
    -- same rank, and the next distinct score skips ahead accordingly --
    -- e.g. four submissions tied at the top all rank 1, and the next one
    -- down ranks 5, not 2. RANK() (unlike ROW_NUMBER()) does this natively
    -- as long as score is the only ORDER BY key feeding it.
    select *, rank() over (order by score desc) as rnk
    from per_sub where eligible and reviews_completed = jcount
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'title', title, 'eligible', eligible, 'reviewsCompleted', reviews_completed,
      'reviewsRequired', jcount, 'loveCount', love_count, 'rejectCount', reject_count,
      'savedForLaterCount', save_for_later_count,
      'byJuror', by_juror, 'rank', rnk
    ) order by rnk, title), '[]'::jsonb) into ranked
  from ranked_cte;

  with per_sub as (
    select s.id, s.title, s.eligible,
      count(v.id) as reviews_completed,
      count(*) filter (where v.vote = 'love') as love_count,
      count(*) filter (where v.vote = 'reject') as reject_count,
      count(*) filter (where v.vote = 'save_for_later') as save_for_later_count,
      coalesce(jsonb_object_agg(j.id, v.vote) filter (where j.id is not null), '{}'::jsonb) as by_juror
    from submissions s
    left join users j on j.role = 'juror'
    left join votes v on v.submission_id = s.id and v.juror_id = j.id and v.vote <> 'skip'
    group by s.id, s.title, s.eligible
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'title', title, 'eligible', eligible, 'reviewsCompleted', reviews_completed,
      'reviewsRequired', jcount, 'loveCount', love_count, 'rejectCount', reject_count,
      'savedForLaterCount', save_for_later_count,
      'byJuror', by_juror, 'rank', null
    ) order by title), '[]'::jsonb) into unranked
  from per_sub where not (eligible and reviews_completed = jcount);

  -- Tie-at-the-cutoff detection: lay out eligible, fully-reviewed
  -- submissions in an arbitrary (ungapped) position order and compare the
  -- score at position 20 against position 21. If they're equal, the Top 20
  -- line falls in the middle of a tied group -- flag the single rank that
  -- whole group shares (competition ranking means they all share one rank
  -- number) plus every submission id in it, for a manual call.
  with per_sub as (
    select s.id, s.title, s.eligible,
      count(v.id) as reviews_completed,
      (count(*) filter (where v.vote = 'love'))::numeric * 1
        + (count(*) filter (where v.vote = 'save_for_later'))::numeric * 0.1
        + (count(*) filter (where v.vote = 'reject'))::numeric * -0.1 as score
    from submissions s
    left join votes v on v.submission_id = s.id and v.vote <> 'skip'
    group by s.id, s.title, s.eligible
  ),
  eligible_complete as (
    select * from per_sub where eligible and reviews_completed = jcount
  ),
  pos_cte as (
    select *, row_number() over (order by score desc) as pos
    from eligible_complete
  )
  select max(score) filter (where pos = 20), max(score) filter (where pos = 21)
    into rank20_score, rank21_score
  from pos_cte;

  if rank20_score is not null and rank21_score is not null and rank20_score = rank21_score then
    select count(*) + 1 into tied_rank from eligible_complete where score > rank20_score;
    select array_agg(id order by title) into tied_ids
      from eligible_complete where score = rank20_score;
    tie_flag := jsonb_build_object('rank', tied_rank, 'submissionIds', to_jsonb(tied_ids));
  end if;

  return jsonb_build_object(
    'ok', true, 'ranked', ranked, 'unranked', unranked, 'jurors', jurors_json, 'tieFlag', tie_flag,
    'top20', (select coalesce(jsonb_agg(elem), '[]'::jsonb) from jsonb_array_elements(ranked) elem where (elem->>'rank')::int <= 20)
  );
end;
$$;
grant execute on function jury_admin_results(text, text) to anon;

-- ---------------------------------------------------------------------
-- 11. jury_admin_submissions -- same score-based ranking, skipCount dropped.
create or replace function jury_admin_submissions(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  a users;
  jcount int;
  out_json jsonb;
begin
  a := jury_auth(p_username, p_password, 'admin');
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  select count(*) into jcount from users where role = 'juror';

  with per_sub as (
    select s.id, count(v.id) as reviews_completed,
      count(*) filter (where v.vote = 'love') as love_count,
      count(*) filter (where v.vote = 'reject') as reject_count,
      count(*) filter (where v.vote = 'save_for_later') as save_for_later_count,
      count(*) filter (where v.comment <> '') as comment_count,
      (count(*) filter (where v.vote = 'love'))::numeric * 1
        + (count(*) filter (where v.vote = 'save_for_later'))::numeric * 0.1
        + (count(*) filter (where v.vote = 'reject'))::numeric * -0.1 as score
    from submissions s left join votes v on v.submission_id = s.id and v.vote <> 'skip'
    group by s.id
  ),
  ranked_cte as (
    -- Same competition ("1224") ranking as jury_admin_results: ties share
    -- a rank and the next distinct score skips ahead.
    select p.id, rank() over (order by p.score desc) as rnk
    from per_sub p join submissions s2 on s2.id = p.id
    where s2.eligible and p.reviews_completed = jcount
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', s.id, 'artistName', s.artist_name, 'title', s.title, 'medium', s.medium, 'year', s.year,
      'eligible', s.eligible, 'reviewsCompleted', p.reviews_completed, 'loveCount', p.love_count,
      'rejectCount', p.reject_count, 'savedForLaterCount', p.save_for_later_count,
      'commentCount', p.comment_count, 'rank', r.rnk,
      'inTop20', coalesce(r.rnk <= 20, false)
    ) order by s.id), '[]'::jsonb) into out_json
  from submissions s
  join per_sub p on p.id = s.id
  left join ranked_cte r on r.id = s.id;

  return jsonb_build_object('ok', true, 'submissions', out_json);
end;
$$;
grant execute on function jury_admin_submissions(text, text) to anon;

-- ---------------------------------------------------------------------
-- 12. jury_admin_jurors -- skipCount dropped; reviewsCompleted excludes
-- a stale 'skip'.
create or replace function jury_admin_jurors(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare a users; elig_subs int; out_json jsonb;
begin
  a := jury_auth(p_username, p_password, 'admin');
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  select count(*) into elig_subs from submissions where eligible;

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', j.id, 'name', j.name, 'username', j.username,
      'reviewsCompleted', (select count(*) from votes v where v.juror_id = j.id and v.vote <> 'skip'),
      'reviewsRequired', elig_subs,
      'loveCount', (select count(*) from votes v where v.juror_id = j.id and v.vote = 'love'),
      'rejectCount', (select count(*) from votes v where v.juror_id = j.id and v.vote = 'reject'),
      'savedForLaterCount', (select count(*) from votes v where v.juror_id = j.id and v.vote = 'save_for_later'),
      'finalized', j.finalized
    ) order by j.name), '[]'::jsonb) into out_json
  from users j where j.role = 'juror';

  return jsonb_build_object('ok', true, 'jurors', out_json);
end;
$$;
grant execute on function jury_admin_jurors(text, text) to anon;

-- jury_admin_submission_detail is intentionally left untouched -- it's the
-- admin's one drill-into-a-single-submission audit view, so a historical
-- 'skip' still shows up there (the frontend labels it as a legacy state)
-- instead of silently disappearing from the record.

-- ---------------------------------------------------------------------
-- 13. jury_admin_export_rows -- CSV export: total_skip column dropped,
-- ranking switches to the same weighted score, per-juror vote labels say
-- "Shortlisted" instead of "Loved" and no longer have a "Skipped" branch.
--
-- This one needs an explicit DROP first: its return type is a TABLE shape
-- (OUT parameters), and Postgres refuses CREATE OR REPLACE when the
-- column list of a table-returning function changes, even to just drop a
-- column. Safe to re-run -- DROP FUNCTION IF EXISTS is a no-op after the
-- first time.
drop function if exists jury_admin_export_rows(text, text);
create or replace function jury_admin_export_rows(p_username text, p_password text)
returns table (
  rank int,
  submission_id text,
  artist_name text,
  artwork_title text,
  per_juror_votes text,
  total_love int,
  total_reject int,
  total_save_for_later int,
  shortlisted text,
  comments text
)
language plpgsql security definer stable set search_path = public
as $$
declare a users; jcount int;
begin
  a := jury_auth(p_username, p_password, 'admin');
  if a.id is null then
    raise exception 'unauthorized';
  end if;
  select count(*) into jcount from users where role = 'juror';

  return query
  with per_sub as (
    select s.id as sid, s.artist_name as sname, s.title as stitle, s.eligible as selig,
      count(v.id) as reviews_completed,
      count(*) filter (where v.vote = 'love') as love_count,
      count(*) filter (where v.vote = 'reject') as reject_count,
      count(*) filter (where v.vote = 'save_for_later') as save_for_later_count,
      (count(*) filter (where v.vote = 'love'))::numeric * 1
        + (count(*) filter (where v.vote = 'save_for_later'))::numeric * 0.1
        + (count(*) filter (where v.vote = 'reject'))::numeric * -0.1 as score
    from submissions s left join votes v on v.submission_id = s.id and v.vote <> 'skip'
    group by s.id, s.artist_name, s.title, s.eligible
  ),
  ranked_cte as (
    -- Same competition ("1224") ranking as jury_admin_results /
    -- jury_admin_submissions: ranked only among eligible, fully-reviewed
    -- submissions (an ineligible or still-in-progress one never occupies a
    -- slot in the ordering), and ties share a rank while the next distinct
    -- score skips ahead.
    select sid, rank() over (order by score desc) as rnk
    from per_sub where selig and reviews_completed = jcount
  )
  select
    r.rnk::int,
    p.sid,
    p.sname,
    p.stitle,
    coalesce((select string_agg(j.name || ': ' || (
        case v.vote
          when 'love' then 'Shortlisted'
          when 'reject' then 'Rejected'
          when 'save_for_later' then 'Saved for Later'
          else null
        end
      ), '; ' order by j.name)
      from users j left join votes v on v.juror_id = j.id and v.submission_id = p.sid and v.vote <> 'skip'
      where j.role = 'juror'), ''),
    p.love_count::int,
    p.reject_count::int,
    p.save_for_later_count::int,
    case when r.rnk is not null and r.rnk <= 20 then 'Yes' else 'No' end,
    coalesce((select string_agg(j2.name || ': ' || v2.comment, ' | ' order by j2.name)
      from votes v2 join users j2 on j2.id = v2.juror_id
      where v2.submission_id = p.sid and v2.comment <> '' and v2.vote <> 'skip'), '')
  from per_sub p
  left join ranked_cte r on r.sid = p.sid
  order by (r.rnk is null), r.rnk, p.stitle;
end;
$$;
grant execute on function jury_admin_export_rows(text, text) to anon;
