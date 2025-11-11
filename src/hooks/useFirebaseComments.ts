import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where,
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  writeBatch,
  increment 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { toast } from 'sonner';

export type ContentType = 'article' | 'magazine' | 'video';

export interface Comment {
  id: string;
  content_type: ContentType;
  content_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  isLiked?: boolean;
}

export const useFirebaseComments = (contentType: ContentType, contentId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('content_type', '==', contentType),
      where('content_id', '==', contentId),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at,
      })) as Comment[];

      // Fetch likes for current user
      const user = auth.currentUser;
      if (user) {
        const likesRef = collection(db, 'comment_likes');
        const likesQuery = query(likesRef, where('user_id', '==', user.uid));
        const likesSnapshot = await getDocs(likesQuery);
        const userLikes = new Set(likesSnapshot.docs.map(doc => doc.data().comment_id));

        commentsData.forEach(comment => {
          comment.isLiked = userLikes.has(comment.id);
        });
      }

      // Structure comments with replies
      const structuredComments = commentsData
        .filter(c => !c.parent_id)
        .map(comment => ({
          ...comment,
          replies: commentsData.filter(c => c.parent_id === comment.id)
        }));

      setComments(structuredComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [contentType, contentId]);

  const createComment = async (content: string, parentId?: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }

    try {
      const batch = writeBatch(db);
      
      const commentRef = doc(collection(db, 'comments'));
      batch.set(commentRef, {
        content_type: contentType,
        content_id: contentId,
        user_id: user.uid,
        content,
        parent_id: parentId || null,
        likes_count: 0,
        replies_count: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // If it's a reply, increment parent's reply count
      if (parentId) {
        const parentRef = doc(db, 'comments', parentId);
        batch.update(parentRef, {
          replies_count: increment(1)
        });
      }

      await batch.commit();
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to post comment');
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        content,
        updated_at: Timestamp.now(),
      });
      toast.success('Comment updated!');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const deleteComment = async (commentId: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      toast.success('Comment deleted!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const toggleLike = async (commentId: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to like');
      return;
    }

    try {
      const likesRef = collection(db, 'comment_likes');
      const q = query(
        likesRef,
        where('user_id', '==', user.uid),
        where('comment_id', '==', commentId)
      );
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      const commentRef = doc(db, 'comments', commentId);

      if (snapshot.empty) {
        // Add like
        const likeRef = doc(collection(db, 'comment_likes'));
        batch.set(likeRef, {
          user_id: user.uid,
          comment_id: commentId,
          created_at: Timestamp.now(),
        });
        batch.update(commentRef, {
          likes_count: increment(1)
        });
      } else {
        // Remove like
        snapshot.docs.forEach(likeDoc => {
          batch.delete(doc(db, 'comment_likes', likeDoc.id));
        });
        batch.update(commentRef, {
          likes_count: increment(-1)
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  return {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
  };
};
