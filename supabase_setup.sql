-- Run this script in your Supabase SQL Editor

-- Create role enum type
create type public.user_role as enum ('student', 'teacher', 'admin');

-- Create the profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  username text,
  avatar_url text,
  role public.user_role default 'student'::public.user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create Policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create trigger function to automatically create a profile for new users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    'student'::public.user_role
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create the courses table
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text not null,
  thumbnail text,
  gradient text,
  price text not null,
  level text not null,
  published boolean default false not null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for courses
alter table public.courses enable row level security;

create policy "Published courses are viewable by everyone." on courses
  for select using (published = true);

create policy "Admins can view all courses." on courses
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert courses." on courses
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update courses." on courses
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete courses." on courses
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Create friend_requests table
create table public.friend_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(sender_id, receiver_id)
);

-- Enable RLS for friend_requests
alter table public.friend_requests enable row level security;

create policy "Users can view requests they sent or received." on friend_requests
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send requests." on friend_requests
  for insert with check (auth.uid() = sender_id);

create policy "Users can update requests they received." on friend_requests
  for update using (auth.uid() = receiver_id);

create policy "Users can delete their own requests." on friend_requests
  for delete using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Create friendships table
create table public.friendships (
  id uuid default gen_random_uuid() primary key,
  user_id_1 uuid references public.profiles(id) not null,
  user_id_2 uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (user_id_1 < user_id_2),
  unique(user_id_1, user_id_2)
);

-- Enable RLS for friendships
alter table public.friendships enable row level security;

create policy "Users can view their friendships." on friendships
  for select using (auth.uid() = user_id_1 or auth.uid() = user_id_2);

create policy "Users can delete their friendships." on friendships
  for delete using (auth.uid() = user_id_1 or auth.uid() = user_id_2);

-- Function to handle accepting friend requests
create or replace function public.accept_friend_request(request_id uuid)
returns void as $$
declare
  req record;
  u1 uuid;
  u2 uuid;
begin
  -- Get the request and ensure it's pending and belongs to the caller
  select * into req from public.friend_requests 
  where id = request_id and receiver_id = auth.uid() and status = 'pending';
  
  if not found then
    raise exception 'Request not found or unauthorized';
  end if;

  -- Update request status
  update public.friend_requests set status = 'accepted' where id = request_id;

  -- Insert into friendships (order UUIDs to satisfy check constraint)
  if req.sender_id < req.receiver_id then
    u1 := req.sender_id;
    u2 := req.receiver_id;
  else
    u1 := req.receiver_id;
    u2 := req.sender_id;
  end if;

  insert into public.friendships (user_id_1, user_id_2)
  values (u1, u2)
  on conflict do nothing;
end;
$$ language plpgsql security definer;
