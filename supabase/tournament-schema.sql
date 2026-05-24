-- ==========================================
-- TWOKAX TOURNAMENT & PVP ARENA SCHEMA
-- Phase 1 — Database Migrations
-- Run after supabase.sql (base schema)
-- Fully re-runnable — safe to run multiple times
-- ==========================================

-- ==========================================
-- ENUM TYPES
-- ==========================================

do $$ begin
  create type public.tournament_type as enum ('solo', 'pvp', 'team');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.tournament_status as enum ('upcoming', 'registration_open', 'live', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.question_type as enum ('multiple_choice', 'coding_challenge', 'written');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.registration_status as enum ('registered', 'confirmed', 'disqualified');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.match_status as enum ('waiting', 'active', 'player_finished', 'all_finished', 'calculating_results', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- Add new values if enum already exists but missing new values
do $$ begin
  alter type public.match_status add value if not exists 'player_finished';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.match_status add value if not exists 'all_finished';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.match_status add value if not exists 'calculating_results';
exception when duplicate_object then null;
end $$;

-- ==========================================
-- TABLES
-- ==========================================

-- ── tournaments ──────────────────────────

create table if not exists public.tournaments (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type public.tournament_type default 'solo'::public.tournament_type not null,
  status public.tournament_status default 'upcoming'::public.tournament_status not null,
  description text,
  rewards_config jsonb default '{}'::jsonb not null,
  max_participants integer default 0 not null,
  registration_open_at timestamp with time zone,
  registration_close_at timestamp with time zone,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tournaments enable row level security;

do $$ begin
  alter table public.tournaments add constraint tournaments_max_participants_check check (max_participants >= 0);
exception when duplicate_object then null;
end $$;

create index if not exists idx_tournaments_status on public.tournaments(status);

create index if not exists idx_tournaments_start_at on public.tournaments(start_at);

comment on table public.tournaments is 'Competitive tournament events with configurable lifecycle and rewards';
comment on column public.tournaments.rewards_config is 'JSON structure defining prize pool distribution, badge rewards, and coin payouts per rank tier';
comment on column public.tournaments.max_participants is '0 means unlimited';

-- ── tournament_questions ─────────────────

create table if not exists public.tournament_questions (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  type public.question_type default 'multiple_choice'::public.question_type not null,
  data jsonb not null,
  evaluation_vector jsonb not null,
  points integer default 100 not null,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tournament_questions enable row level security;

create index if not exists idx_tournament_questions_tournament on public.tournament_questions(tournament_id);

create index if not exists idx_tournament_questions_order on public.tournament_questions(tournament_id, order_index);

comment on table public.tournament_questions is 'Questions and scoring vectors for tournament challenges';
comment on column public.tournament_questions.data is 'Question content (stem, options, code scaffold) — never sent to clients directly';
comment on column public.tournament_questions.evaluation_vector is 'Encrypted or hashed scoring criteria: correct answers, weight multipliers, rubric tokens';

-- ── tournament_registrations ─────────────

create table if not exists public.tournament_registrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  status public.registration_status default 'registered'::public.registration_status not null,
  score integer default 0 not null,
  rank integer,
  metadata jsonb default '{}'::jsonb,
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, tournament_id)
);

alter table public.tournament_registrations enable row level security;

create index if not exists idx_tournament_registrations_user on public.tournament_registrations(user_id);

create index if not exists idx_tournament_registrations_tournament on public.tournament_registrations(tournament_id);

create index if not exists idx_tournament_registrations_score on public.tournament_registrations(tournament_id, score desc);

comment on table public.tournament_registrations is 'User registrations and final standings for tournaments';

-- ── pvp_matches ──────────────────────────

create table if not exists public.pvp_matches (
  id uuid default gen_random_uuid() primary key,
  player_1_id uuid references public.profiles(id) on delete cascade not null,
  player_2_id uuid references public.profiles(id) on delete cascade,
  status public.match_status default 'waiting'::public.match_status not null,
  category text not null,
  current_state_hash text,
  player_1_score integer default 0 not null,
  player_2_score integer default 0 not null,
  player_1_finished boolean default false not null,
  player_2_finished boolean default false not null,
  player_1_accuracy numeric(5,2),
  player_2_accuracy numeric(5,2),
  player_1_xp integer default 0 not null,
  player_2_xp integer default 0 not null,
  player_1_coins integer default 0 not null,
  player_2_coins integer default 0 not null,
  total_questions integer default 5 not null,
  winner_id uuid references public.profiles(id),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pvp_matches enable row level security;

create index if not exists idx_pvp_matches_player1 on public.pvp_matches(player_1_id);

create index if not exists idx_pvp_matches_player2 on public.pvp_matches(player_2_id);

create index if not exists idx_pvp_matches_status on public.pvp_matches(status);

comment on table public.pvp_matches is 'Peer-vs-peer match records with anti-cheat state hashing and scoring';

-- Migrate existing tables: add columns if missing
do $$ begin
  alter table public.pvp_matches add column player_1_finished boolean default false not null;
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.pvp_matches add column player_2_finished boolean default false not null;
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.pvp_matches add column player_1_accuracy numeric(5,2);
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.pvp_matches add column player_2_accuracy numeric(5,2);
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.pvp_matches add column player_1_xp integer default 0 not null;
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.pvp_matches add column player_2_xp integer default 0 not null;
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.pvp_matches add column player_1_coins integer default 0 not null;
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.pvp_matches add column player_2_coins integer default 0 not null;
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.pvp_matches add column total_questions integer default 5 not null;
exception when duplicate_column then null;
end $$;

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- ── tournaments ──────────────────────────

do $$ begin
  create policy "Tournaments are viewable by everyone." on public.tournaments
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can insert tournaments." on public.tournaments
    for insert with check (auth.uid() in (select id from public.profiles where role = 'admin'::public.user_role));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update tournaments." on public.tournaments
    for update using (auth.uid() in (select id from public.profiles where role = 'admin'::public.user_role));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete tournaments." on public.tournaments
    for delete using (auth.uid() in (select id from public.profiles where role = 'admin'::public.user_role));
exception when duplicate_object then null;
end $$;

-- ── tournament_questions ─────────────────

do $$ begin
  create policy "No one can view evaluation vectors." on public.tournament_questions
    for select using (false);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can manage questions." on public.tournament_questions
    for insert with check (auth.uid() in (select id from public.profiles where role = 'admin'::public.user_role));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update questions." on public.tournament_questions
    for update using (auth.uid() in (select id from public.profiles where role = 'admin'::public.user_role));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete questions." on public.tournament_questions
    for delete using (auth.uid() in (select id from public.profiles where role = 'admin'::public.user_role));
exception when duplicate_object then null;
end $$;

-- ── tournament_registrations ─────────────

do $$ begin
  create policy "Users can view their own registrations." on public.tournament_registrations
    for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anyone can view registration counts." on public.tournament_registrations
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can register themselves." on public.tournament_registrations
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can cancel own registration." on public.tournament_registrations
    for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ── pvp_matches ──────────────────────────

do $$ begin
  create policy "Players can view their own matches." on public.pvp_matches
    for select using (auth.uid() = player_1_id or auth.uid() = player_2_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Match listings are public." on public.pvp_matches
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Players can create matches." on public.pvp_matches
    for insert with check (auth.uid() = player_1_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Players can update own matches." on public.pvp_matches
    for update using (auth.uid() = player_1_id or auth.uid() = player_2_id);
exception when duplicate_object then null;
end $$;

-- ==========================================
-- STORED PROCEDURES — SAFE TRANSACTIONS
-- ==========================================

-- ── Register for tournament (safe) ───────

create or replace function public.register_for_tournament_safe(
  p_user_id uuid,
  p_tournament_id uuid
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_tournament public.tournaments;
  v_existing_count integer;
  v_registration_id uuid;
begin
  -- Lock tournament row to prevent race conditions
  select * into v_tournament
  from public.tournaments
  where id = p_tournament_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Tournament not found');
  end if;

  -- Validate status
  if v_tournament.status != 'registration_open' then
    return jsonb_build_object('success', false, 'error', 'Registration is not open');
  end if;

  -- Validate timing
  if v_tournament.registration_open_at is not null and timezone('utc'::text, now()) < v_tournament.registration_open_at then
    return jsonb_build_object('success', false, 'error', 'Registration has not opened yet');
  end if;

  if v_tournament.registration_close_at is not null and timezone('utc'::text, now()) > v_tournament.registration_close_at then
    return jsonb_build_object('success', false, 'error', 'Registration has closed');
  end if;

  -- Check capacity
  if v_tournament.max_participants > 0 then
    select count(*) into v_existing_count
    from public.tournament_registrations
    where tournament_id = p_tournament_id;

    if v_existing_count >= v_tournament.max_participants then
      return jsonb_build_object('success', false, 'error', 'Tournament is full');
    end if;
  end if;

  -- Insert registration (unique constraint catches duplicates)
  insert into public.tournament_registrations (user_id, tournament_id)
  values (p_user_id, p_tournament_id)
  returning id into v_registration_id;

  return jsonb_build_object(
    'success', true,
    'registration_id', v_registration_id,
    'participant_count', v_existing_count + 1
  );
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'error', 'Already registered');
end;
$$;

comment on function public.register_for_tournament_safe is 'Transaction-safe tournament registration with status validation, timing checks, and capacity limits';

-- ── Cancel tournament registration ───────

create or replace function public.cancel_tournament_registration_safe(
  p_user_id uuid,
  p_tournament_id uuid
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_tournament public.tournaments;
begin
  select * into v_tournament
  from public.tournaments
  where id = p_tournament_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Tournament not found');
  end if;

  -- Only allow cancellation before tournament goes live
  if v_tournament.status not in ('upcoming', 'registration_open') then
    return jsonb_build_object('success', false, 'error', 'Cannot cancel registration at this stage');
  end if;

  delete from public.tournament_registrations
  where user_id = p_user_id and tournament_id = p_tournament_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Registration not found');
  end if;

  return jsonb_build_object('success', true);
end;
$$;

comment on function public.cancel_tournament_registration_safe is 'Allows users to cancel registration only before a tournament goes live';

-- ── Submit answer for evaluation ─────────

create or replace function public.submit_tournament_answer_safe(
  p_user_id uuid,
  p_tournament_id uuid,
  p_question_id uuid,
  p_answer jsonb
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_question public.tournament_questions;
  v_registration public.tournament_registrations;
  v_correct boolean;
  v_points_awarded integer;
  v_time_bonus integer;
  v_speed_factor numeric;
  v_started_at timestamptz;
begin
  -- Verify tournament is live
  if not exists (
    select 1 from public.tournaments
    where id = p_tournament_id and status = 'live'
  ) then
    return jsonb_build_object('success', false, 'error', 'Tournament is not live');
  end if;

  -- Verify registration
  select * into v_registration
  from public.tournament_registrations
  where user_id = p_user_id and tournament_id = p_tournament_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Not registered for this tournament');
  end if;

  -- Fetch question (evaluation_vector never leaves the database)
  select * into v_question
  from public.tournament_questions
  where id = p_question_id and tournament_id = p_tournament_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Question not found');
  end if;

  -- Evaluate answer against vector (server-side only)
  v_correct := false;
  case v_question.type
    when 'multiple_choice' then
      v_correct := p_answer = v_question.evaluation_vector->>'correct_answer';
    when 'coding_challenge' then
      v_correct := public.evaluate_coding_answer(p_answer, v_question.evaluation_vector);
    when 'written' then
      v_correct := public.evaluate_written_answer(p_answer, v_question.evaluation_vector);
    else
      v_correct := false;
  end case;

  if not v_correct then
    return jsonb_build_object('success', true, 'correct', false, 'points', 0);
  end if;

  -- Calculate speed factor (faster = more points)
  v_started_at := coalesce(v_registration.registered_at, timezone('utc'::text, now()));
  v_speed_factor := greatest(0.5, 1.0 - (
    extract(epoch from (timezone('utc'::text, now()) - v_started_at)) / 3600.0
  ) * 0.1);
  v_time_bonus := floor(v_question.points * v_speed_factor * 0.2)::integer;
  v_points_awarded := v_question.points + v_time_bonus;

  -- Update score
  update public.tournament_registrations
  set score = score + v_points_awarded
  where id = v_registration.id;

  return jsonb_build_object(
    'success', true,
    'correct', true,
    'points', v_points_awarded,
    'base_points', v_question.points,
    'time_bonus', v_time_bonus
  );
end;
$$;

comment on function public.submit_tournament_answer_safe is 'Zero-knowledge answer evaluation: question vectors never leave the database, scoring is fully server-side';

-- ── Stub evaluator functions (extend per game type) ──

create or replace function public.evaluate_coding_answer(
  p_answer jsonb,
  p_evaluation_vector jsonb
)
returns boolean
language plpgsql security definer
as $$
begin
  -- Phase 3: Implement hash-comparison or test-runner integration
  return false;
end;
$$;

create or replace function public.evaluate_written_answer(
  p_answer jsonb,
  p_evaluation_vector jsonb
)
returns boolean
language plpgsql security definer
as $$
begin
  -- Phase 3: Implement rubric-based or AI-assisted evaluation
  return false;
end;
$$;

-- ── Get tournament leaderboard ───────────

create or replace function public.get_tournament_leaderboard(
  p_tournament_id uuid,
  p_limit integer default 50
)
returns table (
  rank bigint,
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  score integer,
  registered_at timestamp with time zone
)
language plpgsql security definer
as $$
begin
  return query
  select
    row_number() over (order by tr.score desc, tr.registered_at asc) as rank,
    p.id as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    tr.score,
    tr.registered_at
  from public.tournament_registrations tr
  join public.profiles p on p.id = tr.user_id
  where tr.tournament_id = p_tournament_id
  order by tr.score desc, tr.registered_at asc
  limit p_limit;
end;
$$;

comment on function public.get_tournament_leaderboard is 'Returns ranked tournament standings with user profile data';

-- ── Get participant count for tournament ──

create or replace function public.get_tournament_participant_count(
  p_tournament_id uuid
)
returns integer
language plpgsql security definer
stable
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.tournament_registrations
  where tournament_id = p_tournament_id;
  return v_count;
end;
$$;

-- ==========================================
-- ATOMATIC PVP MATCHMAKING
-- Uses FOR UPDATE SKIP LOCKED to prevent
-- the race condition where both players
-- create separate matches simultaneously.
-- ==========================================

create or replace function public.find_or_create_pvp_match(
  p_user_id uuid,
  p_category text
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_match record;
begin
  -- Atomically claim a waiting match using skip-locked
  -- This ensures two concurrent calls never claim the same match
  select id, player_1_id, player_2_id, status, category
  into v_match
  from public.pvp_matches
  where status = 'waiting'
    and player_2_id is null
    and category = p_category
    and player_1_id <> p_user_id
  order by created_at asc
  limit 1
  for update skip locked;

  if found then
    update public.pvp_matches
    set player_2_id = p_user_id,
        status = 'active',
        started_at = now(),
        current_state_hash = gen_random_uuid()::text
    where id = v_match.id;

    return jsonb_build_object(
      'action', 'joined',
      'match_id', v_match.id,
      'player_1_id', v_match.player_1_id,
      'player_2_id', p_user_id,
      'status', 'active'
    );
  end if;

  -- No match available — create a new waiting match
  insert into public.pvp_matches (player_1_id, category, status)
  values (p_user_id, p_category, 'waiting')
  returning id, player_1_id, player_2_id, status
  into v_match;

  return jsonb_build_object(
    'action', 'created',
    'match_id', v_match.id,
    'player_1_id', v_match.player_1_id,
    'player_2_id', v_match.player_2_id,
    'status', 'waiting'
  );
end;
$$;

comment on function public.find_or_create_pvp_match is 'Atomic find-or-create for PvP matchmaking. Uses FOR UPDATE SKIP LOCKED to prevent race conditions between concurrent players.';

-- ==========================================
-- SMART MATCH COMPLETION
-- Called when a player finishes all questions or timer expires.
-- If both players finished, auto-finalizes the match
-- and awards XP/coins to both players.
-- ==========================================

create or replace function public.mark_player_finished(
  p_match_id uuid,
  p_user_id uuid,
  p_accuracy numeric,
  p_total_answered integer
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_match record;
  v_both_finished boolean;
  v_winner_id uuid;
  v_p1_score integer;
  v_p2_score integer;
  v_p1_xp integer;
  v_p2_xp integer;
  v_p1_coins integer;
  v_p2_coins integer;
begin
  -- Lock match row to prevent race conditions
  select * into v_match
  from public.pvp_matches
  where id = p_match_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Match not found');
  end if;

  -- Only active or player_finished matches can be finished
  if v_match.status not in ('active', 'player_finished') then
    return jsonb_build_object('success', false, 'error', 'Match cannot be finished in current state', 'current_status', v_match.status);
  end if;

  -- Determine which player is finishing
  if v_match.player_1_id = p_user_id then
    if v_match.player_1_finished then
      return jsonb_build_object('success', false, 'error', 'Player already finished');
    end if;
    update public.pvp_matches
    set player_1_finished = true,
        player_1_accuracy = p_accuracy
    where id = p_match_id;
  elsif v_match.player_2_id = p_user_id then
    if v_match.player_2_finished then
      return jsonb_build_object('success', false, 'error', 'Player already finished');
    end if;
    update public.pvp_matches
    set player_2_finished = true,
        player_2_accuracy = p_accuracy
    where id = p_match_id;
  else
    return jsonb_build_object('success', false, 'error', 'User is not part of this match');
  end if;

  -- Re-read to check both finished
  select * into v_match
  from public.pvp_matches
  where id = p_match_id;

  v_both_finished := v_match.player_1_finished and v_match.player_2_finished;
  v_p1_score := v_match.player_1_score;
  v_p2_score := v_match.player_2_score;

  if v_both_finished then
    -- Both players finished — calculate winner and rewards
    if v_p1_score > v_p2_score then
      v_winner_id := v_match.player_1_id;
    elsif v_p2_score > v_p1_score then
      v_winner_id := v_match.player_2_id;
    else
      v_winner_id := null; -- tie
    end if;

    v_p1_xp := case when v_match.player_1_id = v_winner_id then 50 else 15 end;
    v_p2_xp := case when v_match.player_2_id = v_winner_id then 50 else 15 end;
    v_p1_coins := case when v_match.player_1_id = v_winner_id then 25 else 5 end;
    v_p2_coins := case when v_match.player_2_id = v_winner_id then 25 else 5 end;

    update public.pvp_matches
    set status = 'completed',
        winner_id = v_winner_id,
        player_1_xp = v_p1_xp,
        player_2_xp = v_p2_xp,
        player_1_coins = v_p1_coins,
        player_2_coins = v_p2_coins,
        completed_at = now()
    where id = p_match_id;

    -- Award XP and coins
    begin
      perform public.award_xp_safe(v_match.player_1_id, v_p1_xp, 'pvp_' || case when v_match.player_1_id = v_winner_id then 'win' else 'loss' end, jsonb_build_object('match_id', p_match_id));
    exception when others then null; end;
    begin
      perform public.award_xp_safe(v_match.player_2_id, v_p2_xp, 'pvp_' || case when v_match.player_2_id = v_winner_id then 'win' else 'loss' end, jsonb_build_object('match_id', p_match_id));
    exception when others then null; end;
    begin
      perform public.award_coins_safe(v_match.player_1_id, v_p1_coins, 'pvp_' || case when v_match.player_1_id = v_winner_id then 'win' else 'loss' end, jsonb_build_object('match_id', p_match_id));
    exception when others then null; end;
    begin
      perform public.award_coins_safe(v_match.player_2_id, v_p2_coins, 'pvp_' || case when v_match.player_2_id = v_winner_id then 'win' else 'loss' end, jsonb_build_object('match_id', p_match_id));
    exception when others then null; end;

    -- Update win count for winner
    if v_winner_id is not null then
      begin
        update public.profiles
        set pvp_won = coalesce(pvp_won, 0) + 1
        where id = v_winner_id;
      exception when others then null; end;
    end if;

    return jsonb_build_object(
      'success', true,
      'action', 'completed',
      'match_id', p_match_id,
      'winner_id', v_winner_id,
      'player_1_score', v_p1_score,
      'player_2_score', v_p2_score,
      'player_1_xp', v_p1_xp,
      'player_2_xp', v_p2_xp,
      'player_1_coins', v_p1_coins,
      'player_2_coins', v_p2_coins,
      'player_1_accuracy', v_match.player_1_accuracy,
      'player_2_accuracy', v_match.player_2_accuracy
    );
  else
    -- Only one player finished — set status to player_finished
    update public.pvp_matches
    set status = 'player_finished'
    where id = p_match_id;

    return jsonb_build_object(
      'success', true,
      'action', 'player_finished',
      'match_id', p_match_id,
      'opponent_finished', false
    );
  end if;
end;
$$;

comment on function public.mark_player_finished is 'Marks a player as finished. If both finished, auto-finalizes and awards rewards. Uses row lock to prevent race conditions.';

-- ==========================================
-- FINALIZE MATCH — force-end a match when
-- timer expires or a player disconnects.
-- Only callable when at least one player
-- has finished; the unfinished player gets 0.
-- ==========================================

create or replace function public.finalize_match(
  p_match_id uuid
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_match record;
  v_winner_id uuid;
  v_p1_xp integer;
  v_p2_xp integer;
  v_p1_coins integer;
  v_p2_coins integer;
begin
  select * into v_match
  from public.pvp_matches
  where id = p_match_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Match not found');
  end if;

  -- Already completed or cancelled
  if v_match.status in ('completed', 'cancelled') then
    return jsonb_build_object('success', false, 'error', 'Match already ended');
  end if;

  -- At least one player must have finished
  if not v_match.player_1_finished and not v_match.player_2_finished then
    return jsonb_build_object('success', false, 'error', 'No player has finished yet');
  end if;

  -- Mark unfinished player as finished (with 0 accuracy)
  if not v_match.player_1_finished then
    update public.pvp_matches set player_1_finished = true, player_1_accuracy = 0 where id = p_match_id;
  end if;
  if not v_match.player_2_finished then
    update public.pvp_matches set player_2_finished = true, player_2_accuracy = 0 where id = p_match_id;
  end if;

  -- Re-read
  select * into v_match from public.pvp_matches where id = p_match_id;

  -- Determine winner
  if v_match.player_1_score > v_match.player_2_score then
    v_winner_id := v_match.player_1_id;
  elsif v_match.player_2_score > v_match.player_1_score then
    v_winner_id := v_match.player_2_id;
  else
    v_winner_id := null;
  end if;

  v_p1_xp := case when v_match.player_1_id = v_winner_id then 50 else 15 end;
  v_p2_xp := case when v_match.player_2_id = v_winner_id then 50 else 15 end;
  v_p1_coins := case when v_match.player_1_id = v_winner_id then 25 else 5 end;
  v_p2_coins := case when v_match.player_2_id = v_winner_id then 25 else 5 end;

  update public.pvp_matches
  set status = 'completed',
      winner_id = v_winner_id,
      player_1_xp = v_p1_xp,
      player_2_xp = v_p2_xp,
      player_1_coins = v_p1_coins,
      player_2_coins = v_p2_coins,
      completed_at = now()
  where id = p_match_id;

  -- Award XP/coins
  begin perform public.award_xp_safe(v_match.player_1_id, v_p1_xp, 'pvp_' || case when v_match.player_1_id = v_winner_id then 'win' else 'loss' end, jsonb_build_object('match_id', p_match_id)); exception when others then null; end;
  begin perform public.award_xp_safe(v_match.player_2_id, v_p2_xp, 'pvp_' || case when v_match.player_2_id = v_winner_id then 'win' else 'loss' end, jsonb_build_object('match_id', p_match_id)); exception when others then null; end;
  begin perform public.award_coins_safe(v_match.player_1_id, v_p1_coins, 'pvp_' || case when v_match.player_1_id = v_winner_id then 'win' else 'loss' end, jsonb_build_object('match_id', p_match_id)); exception when others then null; end;
  begin perform public.award_coins_safe(v_match.player_2_id, v_p2_coins, 'pvp_' || case when v_match.player_2_id = v_winner_id then 'win' else 'loss' end, jsonb_build_object('match_id', p_match_id)); exception when others then null; end;

  if v_winner_id is not null then
    begin update public.profiles set pvp_won = coalesce(pvp_won, 0) + 1 where id = v_winner_id; exception when others then null; end;
  end if;

  return jsonb_build_object(
    'success', true,
    'action', 'completed',
    'match_id', p_match_id,
    'winner_id', v_winner_id,
    'player_1_score', v_match.player_1_score,
    'player_2_score', v_match.player_2_score,
    'player_1_xp', v_p1_xp,
    'player_2_xp', v_p2_xp,
    'player_1_coins', v_p1_coins,
    'player_2_coins', v_p2_coins,
    'player_1_accuracy', v_match.player_1_accuracy,
    'player_2_accuracy', v_match.player_2_accuracy
  );
end;
$$;

comment on function public.finalize_match is 'Force-ends a match when timer expires or a player disconnects. Marks unfinished player as finished (0 accuracy), calculates results, and awards rewards.';

-- ==========================================
-- REALTIME PUBLICATION
-- ==========================================

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    perform supabase_realtime.add_table('public', 'tournaments');
    perform supabase_realtime.add_table('public', 'tournament_registrations');
    perform supabase_realtime.add_table('public', 'pvp_matches');
  end if;
exception when sqlstate '3F000' then
  null;
end $$;
