/**
 * Community Posts Hook for Lovable Cloud
 * Manages CRUD operations and real-time updates for community posts
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CommunityPost {
  id: string;
  user_id: string;
  author_name: string;
  author_role: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  /**
   * Fetch all community posts from the database
   */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new community post
   */
  const createPost = async (content: string, authorName: string, authorRole: string) => {
    if (!user) {
      throw new Error('Must be authenticated to create a post');
    }

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: user.id,
            author_name: authorName,
            author_role: authorRole,
            content,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating post:', error);
      return { data: null, error };
    }
  };

  /**
   * Update an existing post
   */
  const updatePost = async (postId: string, content: string) => {
    if (!user) {
      throw new Error('Must be authenticated to update a post');
    }

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .update({ content })
        .eq('id', postId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating post:', error);
      return { data: null, error };
    }
  };

  /**
   * Delete a post
   */
  const deletePost = async (postId: string) => {
    if (!user) {
      throw new Error('Must be authenticated to delete a post');
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting post:', error);
      return { error };
    }
  };

  /**
   * Increment likes for a post
   */
  const likePost = async (postId: string) => {
    try {
      // Get current post
      const currentPost = posts.find(p => p.id === postId);
      if (!currentPost) return;

      // Optimistically update likes
      const { error } = await supabase
        .from('community_posts')
        .update({ likes: currentPost.likes + 1 })
        .eq('id', postId);

      if (error) {
        console.error('Error liking post:', error);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('community_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        (payload) => {
          // Refetch posts when changes occur
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    likePost,
    refetch: fetchPosts,
  };
};
