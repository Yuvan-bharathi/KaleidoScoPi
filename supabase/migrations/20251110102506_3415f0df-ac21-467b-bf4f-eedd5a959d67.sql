-- Drop trigger first, then function
DROP TRIGGER IF EXISTS set_magazine_total_pages_trigger ON public.magazines;
DROP FUNCTION IF EXISTS public.set_magazine_total_pages();

-- Recreate function with proper security
CREATE OR REPLACE FUNCTION public.set_magazine_total_pages()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.format = 'images' AND NEW.image_urls IS NOT NULL THEN
    NEW.total_pages := array_length(NEW.image_urls, 1);
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER set_magazine_total_pages_trigger
BEFORE INSERT OR UPDATE ON public.magazines
FOR EACH ROW
EXECUTE FUNCTION public.set_magazine_total_pages();