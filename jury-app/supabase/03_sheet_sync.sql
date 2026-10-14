-- Shared Ground Jury App -- Supabase -> Google Sheet live sync
--
-- The Jury Sheet is no longer the source of truth (that's Supabase, as of
-- 01_schema_and_functions.sql + 02_data_migration.sql), but it's still a
-- handy place to glance at votes, comments and juror orders without
-- opening the Supabase dashboard. This file makes jury_vote() and
-- jury_queue() call out to the jury app's Apps Script Web App after they
-- write, so the Sheet's Votes and JurorOrders tabs keep mirroring what's
-- happening live.
--
-- Run this ONCE in Supabase's SQL Editor, AFTER 01_schema_and_functions.sql
-- has already been run. Safe to re-run (every CREATE uses OR REPLACE).
--
-- IMPORTANT: this does NOT touch existing rows. Patricia and Jalal's
-- current votes in Supabase were test votes and are intentionally not
-- backfilled into the Sheet by this script -- only votes/queue generation
-- that happen from here on will sync.
--
-- Requires the Apps Script Web App to already have the doPost(e) handler
-- from the latest jury-app/google-apps-script/Code.gs pasted in and
-- redeployed (Deploy > Manage deployments > Edit > New version), with a
-- JURY_SYNC_SECRET that matches the secret hardcoded below exactly.

-- pg_net lets Postgres make outbound HTTP calls asynchronously (it queues
-- the request and a background worker sends it -- this statement doesn't
-- wait on any network round trip). Supabase ships this pre-installed; this
-- just turns it on for this project if it isn't already.
create extension if not exists pg_net with schema extensions;

-- Posts a payload to the jury app's Apps Script Web App, which upserts the
-- matching row into the Google Sheet. Every error is swallowed here on
-- purpose: a Sheet-sync hiccup (Apps Script cold-starting, briefly down,
-- whatever) must NEVER be able to block a juror's vote or queue fetch --
-- that exact coupling is the fragility this app moved away from when it
-- left Apps Script as the primary backend. Supabase stays the single
-- source of truth regardless of whether any single sync call lands.
create or replace function jury_sync_to_sheet(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform net.http_post(
    url := 'https://script.google.com/macros/s/AKfycbzfkIpQ1DZgAER5K7zDgDXoD2trkgmocWn5Pw2KniRgdindcyt_jQCAB1EQwFgsgfU1yw/exec',
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
exception when others then
  null;
end;
$$;

-- Re-creates jury_vote() with one addition: after the vote is saved, fire
-- a sync so the Sheet's Votes tab (JurorID, SubmissionID, Vote, Comment,
-- UpdatedAt) gets the same row upserted. Everything else is unchanged from
-- 01_schema_and_functions.sql.
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

-- Re-creates jury_queue() with one addition: when this call actually adds
-- new submissions to the juror's order (new_ids is non-empty -- true the
-- first time a juror's queue is generated, and again later only if fresh
-- eligible submissions get added), fire a sync so the Sheet's JurorOrders
-- tab gets that juror's row overwritten with the final CSV order.
--
-- Deliberately gated on new_ids rather than firing on every call: jury_queue
-- runs on basically every "Pending" tab load/refresh, and the order is
-- stable after the first generation, so syncing unconditionally would spam
-- the Apps Script endpoint with an identical CSV on every single page load
-- for no benefit. Everything else is unchanged from
-- 01_schema_and_functions.sql.
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

  if array_length(new_ids, 1) > 0 then
    perform jury_sync_to_sheet(jsonb_build_object(
      'type', 'juror_order',
      'secret', 'RgriRYQLSgG6v8ESBKd-2LFFeXJl2qSC',
      'jurorId', u.id,
      'orderCsv', array_to_string(final_ids, ',')
    ));
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
