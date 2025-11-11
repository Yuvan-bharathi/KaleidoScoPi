-- Remove author_age column from community_posts table to protect children's privacy
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS author_age;