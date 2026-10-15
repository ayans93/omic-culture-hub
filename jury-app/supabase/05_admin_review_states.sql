-- Shared Ground Jury App -- admin dashboard support for the 4 vote states
--
-- 04_review_states_and_compare.sql added "reject" and "save_for_later" as
-- vote values jurors can cast, and updated the juror-facing jury_review()
-- to break them out. The admin-facing functions (jury_admin_results,
-- jury_admin_submissions, jury_admin_jurors, jury_admin_export_rows) were
-- deliberately left alone in that pass -- they still only ever counted
-- 'love' and 'skip', so a Rejected or Saved for Later vote was invisible
-- on the admin dashboard even though it was being recorded correctly.
-- This file adds rejectCount/savedForLaterCount alongside the existing
-- loveCount/skipCount everywhere the admin dashboard shows per-vote
-- counts, and fixes the CSV export's per-juror vote labels to spell out
-- all four states instead of just "Love"/"Skip".
--
-- Run this ONCE in Supabase's SQL Editor, AFTER 01_schema_and_functions.sql,
-- 03_sheet_sync.sql, and 04_review_states_and_compare.sql have already
-- been run. Safe to re-run (every CREATE uses OR REPLACE).
--
-- Ranking (Top 20 / tie detection) is unchanged -- it's still Love-count
-- only, same as before. Reject/Save for Later are informational counts on
-- the admin side, not part of the ranking criteria.

-- ---------------------------------------------------------------------
-- jury_admin_results -- Results & Top 20 tab: rejectCount/savedForLaterCount
-- added alongside loveCount/skipCount on every row (ranked and unranked).
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
  rank20_love int; rank21_love int;
  tied_ranks int[]; tied_ids text[];
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
      count(*) filter (where v.vote = 'skip') as skip_count,
      coalesce(jsonb_object_agg(j.id, v.vote) filter (where j.id is not null), '{}'::jsonb) as by_juror
    from submissions s
    left join users j on j.role = 'juror'
    left join votes v on v.submission_id = s.id and v.juror_id = j.id
    group by s.id, s.title, s.eligible
  ),
  ranked_cte as (
    select *, row_number() over (order by love_count desc, id) as rnk
    from per_sub where eligible and reviews_completed = jcount
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'title', title, 'eligible', eligible, 'reviewsCompleted', reviews_completed,
      'reviewsRequired', jcount, 'loveCount', love_count, 'rejectCount', reject_count,
      'savedForLaterCount', save_for_later_count, 'skipCount', skip_count,
      'byJuror', by_juror, 'rank', rnk
    ) order by rnk), '[]'::jsonb) into ranked
  from ranked_cte;

  with per_sub as (
    select s.id, s.title, s.eligible,
      count(v.id) as reviews_completed,
      count(*) filter (where v.vote = 'love') as love_count,
      count(*) filter (where v.vote = 'reject') as reject_count,
      count(*) filter (where v.vote = 'save_for_later') as save_for_later_count,
      count(*) filter (where v.vote = 'skip') as skip_count,
      coalesce(jsonb_object_agg(j.id, v.vote) filter (where j.id is not null), '{}'::jsonb) as by_juror
    from submissions s
    left join users j on j.role = 'juror'
    left join votes v on v.submission_id = s.id and v.juror_id = j.id
    group by s.id, s.title, s.eligible
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'title', title, 'eligible', eligible, 'reviewsCompleted', reviews_completed,
      'reviewsRequired', jcount, 'loveCount', love_count, 'rejectCount', reject_count,
      'savedForLaterCount', save_for_later_count, 'skipCount', skip_count,
      'byJuror', by_juror, 'rank', null
    )), '[]'::jsonb) into unranked
  from per_sub where not (eligible and reviews_completed = jcount);

  select (elem->>'loveCount')::int into rank20_love from jsonb_array_elements(ranked) elem where (elem->>'rank')::int = 20;
  select (elem->>'loveCount')::int into rank21_love from jsonb_array_elements(ranked) elem where (elem->>'rank')::int = 21;
  if rank20_love is not null and rank21_love is not null and rank20_love = rank21_love then
    select array_agg((elem->>'rank')::int), array_agg(elem->>'id') into tied_ranks, tied_ids
      from jsonb_array_elements(ranked) elem where (elem->>'loveCount')::int = rank20_love;
    tie_flag := jsonb_build_object('loveCount', rank20_love, 'ranks', to_jsonb(tied_ranks), 'submissionIds', to_jsonb(tied_ids));
  end if;

  return jsonb_build_object(
    'ok', true, 'ranked', ranked, 'unranked', unranked, 'jurors', jurors_json, 'tieFlag', tie_flag,
    'top20', (select coalesce(jsonb_agg(elem), '[]'::jsonb) from jsonb_array_elements(ranked) elem where (elem->>'rank')::int <= 20)
  );
end;
$$;
grant execute on function jury_admin_results(text, text) to anon;

-- ---------------------------------------------------------------------
-- jury_admin_submissions -- Submissions tab: same two counts added.
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
      count(*) filter (where v.vote = 'skip') as skip_count,
      count(*) filter (where v.comment <> '') as comment_count
    from submissions s left join votes v on v.submission_id = s.id
    group by s.id
  ),
  ranked_cte as (
    select p.id, row_number() over (order by p.love_count desc, p.id) as rnk
    from per_sub p join submissions s2 on s2.id = p.id
    where s2.eligible and p.reviews_completed = jcount
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', s.id, 'artistName', s.artist_name, 'title', s.title, 'medium', s.medium, 'year', s.year,
      'eligible', s.eligible, 'reviewsCompleted', p.reviews_completed, 'loveCount', p.love_count,
      'rejectCount', p.reject_count, 'savedForLaterCount', p.save_for_later_count,
      'skipCount', p.skip_count, 'commentCount', p.comment_count, 'rank', r.rnk,
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
-- jury_admin_jurors -- Jurors tab: same two counts added, per juror.
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
      'reviewsCompleted', (select count(*) from votes v where v.juror_id = j.id),
      'reviewsRequired', elig_subs,
      'loveCount', (select count(*) from votes v where v.juror_id = j.id and v.vote = 'love'),
      'rejectCount', (select count(*) from votes v where v.juror_id = j.id and v.vote = 'reject'),
      'savedForLaterCount', (select count(*) from votes v where v.juror_id = j.id and v.vote = 'save_for_later'),
      'skipCount', (select count(*) from votes v where v.juror_id = j.id and v.vote = 'skip'),
      'finalized', j.finalized
    ) order by j.name), '[]'::jsonb) into out_json
  from users j where j.role = 'juror';

  return jsonb_build_object('ok', true, 'jurors', out_json);
end;
$$;
grant execute on function jury_admin_jurors(text, text) to anon;

-- ---------------------------------------------------------------------
-- jury_admin_export_rows -- CSV export: two more total columns, and the
-- per-juror votes string now spells out all four states ("Loved",
-- "Rejected", "Saved for Later", "Skipped") instead of only "Love"/"Skip".
-- A juror who hasn't voted on a submission yet is still omitted from that
-- string entirely, same as before (the CASE below falls through to NULL
-- for them, which string_agg silently skips).
--
-- This one needs an explicit DROP first: its return type is a TABLE shape
-- (OUT parameters), and Postgres refuses CREATE OR REPLACE when the
-- column list of a table-returning function changes, even to just add
-- columns. Safe to re-run -- DROP FUNCTION IF EXISTS is a no-op the first
-- time.
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
  total_skip int,
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
      count(*) filter (where v.vote = 'skip') as skip_count
    from submissions s left join votes v on v.submission_id = s.id
    group by s.id, s.artist_name, s.title, s.eligible
  ),
  ranked_cte as (
    select *, case when selig and reviews_completed = jcount
      then row_number() over (order by love_count desc, sid) else null end as rnk
    from per_sub
  )
  select
    r.rnk::int,
    r.sid,
    r.sname,
    r.stitle,
    coalesce((select string_agg(j.name || ': ' || (
        case v.vote
          when 'love' then 'Loved'
          when 'reject' then 'Rejected'
          when 'save_for_later' then 'Saved for Later'
          when 'skip' then 'Skipped'
          else null
        end
      ), '; ' order by j.name)
      from users j left join votes v on v.juror_id = j.id and v.submission_id = r.sid
      where j.role = 'juror'), ''),
    r.love_count::int,
    r.reject_count::int,
    r.save_for_later_count::int,
    r.skip_count::int,
    case when r.rnk is not null and r.rnk <= 20 then 'Yes' else 'No' end,
    coalesce((select string_agg(j2.name || ': ' || v2.comment, ' | ' order by j2.name)
      from votes v2 join users j2 on j2.id = v2.juror_id
      where v2.submission_id = r.sid and v2.comment <> ''), '')
  from ranked_cte r
  order by (r.rnk is null), r.rnk, r.sid;
end;
$$;
grant execute on function jury_admin_export_rows(text, text) to anon;
