-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create magazines table
CREATE TABLE public.magazines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  cover_image_url TEXT,
  issue_number INTEGER,
  published_date DATE,
  total_pages INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.magazines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Magazines are viewable by everyone" 
ON public.magazines FOR SELECT USING (true);

-- Create magazine comments table
CREATE TABLE public.magazine_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  magazine_id UUID NOT NULL REFERENCES public.magazines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.magazine_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
ON public.magazine_comments FOR SELECT USING (true);

CREATE POLICY "Users can create comments" 
ON public.magazine_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.magazine_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.magazine_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Create magazine likes table
CREATE TABLE public.magazine_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  magazine_id UUID NOT NULL REFERENCES public.magazines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(magazine_id, user_id)
);

ALTER TABLE public.magazine_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" 
ON public.magazine_likes FOR SELECT USING (true);

CREATE POLICY "Users can like magazines" 
ON public.magazine_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike magazines" 
ON public.magazine_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Create comment likes table
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.magazine_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment likes are viewable by everyone" 
ON public.comment_likes FOR SELECT USING (true);

CREATE POLICY "Users can like comments" 
ON public.comment_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" 
ON public.comment_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Create magazine page bookmarks table
CREATE TABLE public.magazine_page_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  magazine_id UUID NOT NULL REFERENCES public.magazines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  page_number INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(magazine_id, user_id, page_number)
);

ALTER TABLE public.magazine_page_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" 
ON public.magazine_page_bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks" 
ON public.magazine_page_bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.magazine_page_bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_magazines_updated_at
BEFORE UPDATE ON public.magazines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_magazine_comments_updated_at
BEFORE UPDATE ON public.magazine_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();