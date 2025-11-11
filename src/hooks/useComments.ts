/**
 * Unified Comments Hook
 * Manages comments, replies, and likes with real-time updates
 * Works across Articles, Magazines, and Videos
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type ContentType = 'article' | 'magazine' | 'video';

export interface Comment {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  // Client-side computed fields
  replies?: Comment[];
  isLiked?: boolean;
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export const useComments = (contentType: ContentType, contentId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  /**
   * Fetch all comments for the content (top-level + nested replies)
   */
  const fetchComments = async () => {
    try {
      setLoading(true);

      // Fetch all comments for this content
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch user's likes if authenticated
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);

        userLikes = likesData?.map(like => like.comment_id) || [];
      }

      // Build nested comment structure
      const topLevelComments = commentsData?.filter(c => !c.parent_id) || [];
      const repliesMap = new Map<string, Comment[]>();

      commentsData?.forEach(comment => {
        if (comment.parent_id) {
          if (!repliesMap.has(comment.parent_id)) {
            repliesMap.set(comment.parent_id, []);
          }
          repliesMap.get(comment.parent_id)?.push({
            ...comment,
            isLiked: userLikes.includes(comment.id),
          });
        }
      });

      // Attach replies to top-level comments
      const structuredComments = topLevelComments.map(comment => ({
        ...comment,
        replies: repliesMap.get(comment.id) || [],
        isLiked: userLikes.includes(comment.id),
      }));

      setComments(structuredComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new comment or reply
   */
  const createComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return { data: null, error: 'Not authenticated' };
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return { data: null, error: 'Empty content' };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          parent_id: parentId || null,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(parentId ? 'Reply posted!' : 'Comment posted!');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating comment:', error);
      toast.error('Failed to post comment');
      return { data: null, error };
    }
  };

  /**
   * Update an existing comment
   */
  const updateComment = async (commentId: string, content: string) => {
    if (!user) {
      toast.error('Please sign in to edit comments');
      return { data: null, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ content: content.trim() })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Comment updated');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
      return { data: null, error };
    }
  };

  /**
   * Delete a comment
   */
  const deleteComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to delete comments');
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Comment deleted');
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      return { error };
    }
  };

  /**
   * Toggle like on a comment
   */
  const toggleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
      }

      // Refresh comments to update like counts
      fetchComments();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchComments();

    // Subscribe to comment changes
    const commentsChannel = supabase
      .channel(`comments:${contentType}:${contentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `content_type=eq.${contentType},content_id=eq.${contentId}`,
        },
        () => {
          // Refetch when any comment changes
          fetchComments();
        }
      )
      .subscribe();

    // Subscribe to like changes
    const likesChannel = supabase
      .channel(`comment_likes:${contentType}:${contentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_likes',
        },
        () => {
          // Refetch when likes change
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [contentType, contentId, user?.id]);

  return {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    refetch: fetchComments,
  };
};
