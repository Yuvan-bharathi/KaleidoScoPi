-- Fix security warnings by setting search_path on functions

-- Update increment_reply_count function
CREATE OR REPLACE FUNCTION increment_reply_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    UPDATE public.comments
    SET replies_count = replies_count + 1
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Update decrement_reply_count function
CREATE OR REPLACE FUNCTION decrement_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.parent_id IS NOT NULL THEN
    UPDATE public.comments
    SET replies_count = GREATEST(0, replies_count - 1)
    WHERE id = OLD.parent_id;
  END IF;
  RETURN OLD;
END;
$$;

-- Update update_comment_likes_count function
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
END;
$$;