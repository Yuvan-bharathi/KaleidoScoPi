-- Create storage bucket for magazine images
INSERT INTO storage.buckets (id, name, public)
VALUES ('magazine-images', 'magazine-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for magazine images
CREATE POLICY "Magazine images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'magazine-images');

CREATE POLICY "Authenticated users can upload magazine images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'magazine-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update magazine images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'magazine-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete magazine images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'magazine-images' 
  AND auth.role() = 'authenticated'
);

-- Add format and image_urls columns to magazines table
ALTER TABLE public.magazines
ADD COLUMN IF NOT EXISTS format text DEFAULT 'pdf' CHECK (format IN ('pdf', 'images')),
ADD COLUMN IF NOT EXISTS image_urls text[];

-- Make pdf_url nullable for image-based magazines
ALTER TABLE public.magazines
ALTER COLUMN pdf_url DROP NOT NULL;

-- Add check constraint to ensure either pdf_url or image_urls is provided
ALTER TABLE public.magazines
ADD CONSTRAINT magazine_content_check 
CHECK (
  (format = 'pdf' AND pdf_url IS NOT NULL) OR
  (format = 'images' AND image_urls IS NOT NULL AND array_length(image_urls, 1) > 0)
);

-- Update total_pages based on format
CREATE OR REPLACE FUNCTION public.set_magazine_total_pages()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.format = 'images' AND NEW.image_urls IS NOT NULL THEN
    NEW.total_pages := array_length(NEW.image_urls, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_magazine_total_pages_trigger
BEFORE INSERT OR UPDATE ON public.magazines
FOR EACH ROW
EXECUTE FUNCTION public.set_magazine_total_pages();

-- Grant INSERT permissions on magazines table for authenticated users
CREATE POLICY "Authenticated users can create magazines"
ON public.magazines
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');