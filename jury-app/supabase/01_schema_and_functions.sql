-- Shared Ground Jury App — Supabase schema + RPC functions
--
-- Replaces the Google Sheet + Apps Script backend with a real Postgres
-- database and a set of SECURITY DEFINER functions that mirror each
-- handler in the old Code.gs one-for-one (same names you'll recognize:
-- login, queue, submission, vote, review, finalize, admin overview/
-- submissions/results/jurors/unlock/export). The frontend calls these as
-- RPCs over Supabase's REST API instead of JSONP against an Apps Script
-- /exec URL -- same trust model (username+password sent per call, no
-- Supabase Auth involved), but with real CORS instead of a <script> tag
-- hack, and no Apps Script cold-start flakiness.
--
-- Run this whole file once in Supabase's SQL Editor (Dashboard -> SQL
-- Editor -> New query -> paste -> Run). It's safe to re-run: every
-- CREATE uses IF NOT EXISTS / OR REPLACE.
--
-- SECURITY: RLS is enabled on every table with NO policies, and table
-- grants to anon/authenticated are revoked -- so even with the public
-- "anon" API key, nobody can SELECT/INSERT/UPDATE a table directly over
-- the REST API. The ONLY way in is through the functions below, each
-- individually granted EXECUTE to anon. This matches (and is actually
-- tighter than) the old Apps Script setup, where only the specific
-- formType handlers were reachable, never the raw Sheet.

-- ---------------------------------------------------------------------
-- Tables

create table if not exists users (
  id text primary key,
  username text not null unique,
  password text not null,
  role text not null check (role in ('admin', 'juror')),
  name text not null,
  finalized boolean not null default false,
  finalized_at timestamptz
);

create table if not exists submissions (
  id text primary key,
  artist_name text not null default '',
  mobile text not null default '',
  email text not null default '',
  uae_resident text not null default '',
  title text not null default '',
  discipline text not null default '',
  medium text not null default '',
  dimensions text not null default '',
  year text not null default '',
  statement text not null default '',
  bio text not null default '',
  art_link text not null default '',
  eligible boolean not null default true,
  ineligible_reason text not null default '',
  -- Pre-resolved once from the Drive images folder at migration time (see
  -- resolveAllImages_ in Code.gs + the migration script). There is no live
  -- Drive lookup from Supabase -- if a new submission is added after this
  -- migration, its image_url stays null (shown as "Image not available
  -- yet" to jurors) until someone fills it in by hand here.
  image_type text,        -- 'image' | 'file' | null
  image_url text,
  image_mime_type text
);

create table if not exists votes (
  id bigint generated always as identity primary key,
  juror_id text not null references users(id),
  submission_id text not null references submissions(id),
  vote text not null check (vote in ('love', 'skip')),
  comment text not null default '',
  updated_at timestamptz not null default now(),
  unique (juror_id, submission_id)
);
create index if not exists votes_submission_idx on votes(submission_id);
create index if not exists votes_juror_idx on votes(juror_id);

-- Replaces the old JurorOrders tab's CSV-in-a-cell with a real row per
-- (juror, submission, position) -- rebuilt on every jury_queue() call
-- (cheap at this scale), which also naturally handles newly-added
-- eligible submissions and drops stale/ineligible ones.
create table if not exists juror_queue (
  juror_id text not null references users(id),
  submission_id text not null references submissions(id),
  position integer not null,
  primary key (juror_id, submission_id)
);

alter table users enable row level security;
alter table submissions enable row level security;
alter table votes enable row level security;
alter table juror_queue enable row level security;
revoke all on users, submissions, votes, juror_queue from anon, authenticated;

-- ---------------------------------------------------------------------
-- Internal helpers (not granted to anon -- only callable from the
-- SECURITY DEFINER functions below, which run as this script's owner)

create or replace function jury_auth(p_username text, p_password text, p_required_role text default null)
returns users
language plpgsql
security definer
set search_path = public
as $$
declare
  u users;
begin
  select * into u from users where lower(username) = lower(trim(p_username)) and password = p_password;
  if u.id is null then
    return null;
  end if;
  if p_required_role is not null and u.role <> p_required_role then
    return null;
  end if;
  return u;
end;
$$;

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
  left join votes v on v.juror_id = j.id and v.submission_id = p_submission_id
  where j.role = 'juror' and j.id <> p_excluding_juror_id;
$$;

create or replace function jury_image_json(s submissions)
returns jsonb
language sql
immutable
as $$
  select case when s.image_url is not null
    then jsonb_build_object('type', s.image_type, 'mimeType', s.image_mime_type, 'url', s.image_url)
    else null end;
$$;

create or replace function jury_blind_view(s submissions)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'id', s.id, 'title', s.title, 'discipline', s.discipline, 'medium', s.medium,
    'statement', s.statement, 'image', jury_image_json(s)
  );
$$;

-- ---------------------------------------------------------------------
-- Public RPCs

create or replace function jury_login(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare u users;
begin
  u := jury_auth(p_username, p_password);
  if u.id is null then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object('ok', true, 'role', u.role, 'name', u.name, 'id', u.id);
end;
$$;
grant execute on function jury_login(text, text) to anon;

create or replace function jury_queue(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  u users;
  eligible_ids text[];
  existing_ids text[];
  new_ids text[];
  final_ids text[];
  completed_ids text[];
begin
  u := jury_auth(p_username, p_password, 'juror');
  if u.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select coalesce(array_agg(id order by id), '{}') into eligible_ids from submissions where eligible;

  select coalesce(array_agg(submission_id order by position), '{}') into existing_ids
    from juror_queue where juror_id = u.id;
  select coalesce(array_agg(x), '{}') into existing_ids
    from unnest(existing_ids) x where x = any(eligible_ids);

  select coalesce(array_agg(x order by random()), '{}') into new_ids
    from unnest(eligible_ids) x where not (x = any(existing_ids));

  final_ids := existing_ids || new_ids;

  delete from juror_queue where juror_id = u.id;
  if array_length(final_ids, 1) > 0 then
    insert into juror_queue (juror_id, submission_id, position)
    select u.id, s, row_number() over () from unnest(final_ids) s;
  end if;

  select coalesce(array_agg(submission_id), '{}') into completed_ids
    from votes where juror_id = u.id and submission_id = any(final_ids);

  return jsonb_build_object(
    'ok', true, 'order', to_jsonb(final_ids), 'completed', to_jsonb(completed_ids),
    'total', coalesce(array_length(final_ids, 1), 0), 'finalized', u.finalized
  );
end;
$$;
grant execute on function jury_queue(text, text) to anon;

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

  select * into my_vote from votes where juror_id = u.id and submission_id = p_id;
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
  if p_vote not in ('love', 'skip') then
    return jsonb_build_object('ok', false, 'error', 'bad_request');
  end if;
  if not exists (select 1 from submissions where id = p_submission_id) then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  insert into votes (juror_id, submission_id, vote, comment, updated_at)
  values (u.id, p_submission_id, p_vote, coalesce(p_comment, ''), now())
  on conflict (juror_id, submission_id)
  do update set vote = excluded.vote, comment = excluded.comment, updated_at = excluded.updated_at;

  return jsonb_build_object('ok', true, 'saved', true, 'othersVotes', jury_others_votes(p_submission_id, u.id));
end;
$$;
grant execute on function jury_vote(text, text, text, text, text) to anon;

create or replace function jury_review(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  u users;
  total int; completed int;
  loved jsonb; skipped jsonb;
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
    ) order by s.title), '[]'::jsonb) into skipped
    from votes v join submissions s on s.id = v.submission_id
    where v.juror_id = u.id and v.vote = 'skip';

  return jsonb_build_object(
    'ok', true, 'finalized', u.finalized, 'finalizedAt', u.finalized_at,
    'reviewsCompleted', completed, 'reviewsRequired', total, 'loved', loved, 'skipped', skipped
  );
end;
$$;
grant execute on function jury_review(text, text) to anon;

create or replace function jury_finalize(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare u users; missing int;
begin
  u := jury_auth(p_username, p_password, 'juror');
  if u.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select count(*) into missing from submissions s
    where s.eligible and not exists (select 1 from votes v where v.juror_id = u.id and v.submission_id = s.id);
  if missing > 0 then
    return jsonb_build_object('ok', false, 'error', 'You still have ' || missing || ' artwork(s) to react to before finalizing.');
  end if;

  update users set finalized = true, finalized_at = now() where id = u.id;
  return jsonb_build_object('ok', true, 'finalized', true);
end;
$$;
grant execute on function jury_finalize(text, text) to anon;

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
  select count(*) into comp from votes;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', j.id, 'name', j.name,
    'completed', (select count(*) from votes v where v.juror_id = j.id),
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
      'reviewsRequired', jcount, 'loveCount', love_count, 'skipCount', skip_count,
      'byJuror', by_juror, 'rank', rnk
    ) order by rnk), '[]'::jsonb) into ranked
  from ranked_cte;

  with per_sub as (
    select s.id, s.title, s.eligible,
      count(v.id) as reviews_completed,
      count(*) filter (where v.vote = 'love') as love_count,
      count(*) filter (where v.vote = 'skip') as skip_count,
      coalesce(jsonb_object_agg(j.id, v.vote) filter (where j.id is not null), '{}'::jsonb) as by_juror
    from submissions s
    left join users j on j.role = 'juror'
    left join votes v on v.submission_id = s.id and v.juror_id = j.id
    group by s.id, s.title, s.eligible
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'title', title, 'eligible', eligible, 'reviewsCompleted', reviews_completed,
      'reviewsRequired', jcount, 'loveCount', love_count, 'skipCount', skip_count,
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

create or replace function jury_admin_submission_detail(p_username text, p_password text, p_id text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  a users;
  s submissions;
  votes_json jsonb;
begin
  a := jury_auth(p_username, p_password, 'admin');
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;

  select * into s from submissions where id = p_id;
  if s.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'jurorId', j.id, 'jurorName', j.name, 'vote', v.vote, 'comment', v.comment, 'updatedAt', v.updated_at
    ) order by j.name), '[]'::jsonb) into votes_json
  from votes v join users j on j.id = v.juror_id where v.submission_id = p_id;

  return jsonb_build_object(
    'ok', true,
    'submission', jsonb_build_object(
      'id', s.id, 'artistName', s.artist_name, 'mobile', s.mobile, 'email', s.email,
      'title', s.title, 'discipline', s.discipline, 'medium', s.medium, 'dimensions', s.dimensions,
      'year', s.year, 'statement', s.statement, 'bio', s.bio, 'eligible', s.eligible,
      'image', jury_image_json(s)
    ),
    'votes', votes_json
  );
end;
$$;
grant execute on function jury_admin_submission_detail(text, text, text) to anon;

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
      'skipCount', (select count(*) from votes v where v.juror_id = j.id and v.vote = 'skip'),
      'finalized', j.finalized
    ) order by j.name), '[]'::jsonb) into out_json
  from users j where j.role = 'juror';

  return jsonb_build_object('ok', true, 'jurors', out_json);
end;
$$;
grant execute on function jury_admin_jurors(text, text) to anon;

create or replace function jury_admin_juror_unlock(p_username text, p_password text, p_id text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare a users;
begin
  a := jury_auth(p_username, p_password, 'admin');
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  update users set finalized = false, finalized_at = null where id = p_id;
  return jsonb_build_object('ok', true, 'unlocked', true);
end;
$$;
grant execute on function jury_admin_juror_unlock(text, text, text) to anon;

-- CSV export. Table-returning + STABLE so PostgREST allows calling it as a
-- plain GET (Accept: text/csv) -- a real <a href> link the admin clicks,
-- same as the old Apps Script export, instead of needing a POST + blob
-- download dance.
create or replace function jury_admin_export_rows(p_username text, p_password text)
returns table (
  rank int,
  submission_id text,
  artist_name text,
  artwork_title text,
  per_juror_votes text,
  total_love int,
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
    coalesce((select string_agg(j.name || ': ' || initcap(v.vote), '; ' order by j.name)
      from users j left join votes v on v.juror_id = j.id and v.submission_id = r.sid
      where j.role = 'juror'), ''),
    r.love_count::int,
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
