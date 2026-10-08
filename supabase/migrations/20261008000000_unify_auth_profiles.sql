-- Keep the profile email available as the provider-independent account key.
-- This lets Google OAuth and OTP logins resolve the same profile.
alter table public.profiles
  add column if not exists email text;

update public.profiles
set email = lower(auth_users.email)
from auth.users as auth_users
where public.profiles.id = auth_users.id
  and public.profiles.email is null
  and auth_users.email is not null;

create unique index if not exists profiles_email_lower_unique
  on public.profiles (lower(email))
  where email is not null;

-- The original auth trigger used columns from the old profiles schema.
-- Keep OAuth-created users compatible with the current profile table.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(new.email),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    case
      when new.raw_user_meta_data ->> 'role' in ('donor', 'receiver')
        then new.raw_user_meta_data ->> 'role'
      else null
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        role = coalesce(public.profiles.role, excluded.role);
  return new;
end;
$$;
