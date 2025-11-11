import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { useFirebaseAuth } from './useFirebaseAuth';
import { toast } from 'sonner';

export type ContentType = 'article' | 'magazine' | 'video';

export interface Comment {
  id: string;
  userId: string;
  contentType: ContentType;
  contentId: string;
  parentId: string | null;
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: any;
  updatedAt: any;
  replies?: Comment[];
  isLiked?: boolean;
}

export const useComments = (contentType: ContentType, contentId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebaseAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('contentType', '==', contentType),
      where('contentId', '==', contentId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      let userLikes: string[] = [];
      if (user) {
        const userLikesSnapshot = await getDocs(
          collection(db, 'users', user.uid, 'commentLikes')
        );
        userLikes = userLikesSnapshot.docs.map((doc) => doc.id);
      }

      const topLevelComments = commentsData.filter((c) => !c.parentId);
      const repliesMap = new Map<string, Comment[]>();

      commentsData.forEach((comment) => {
        if (comment.parentId) {
          if (!repliesMap.has(comment.parentId)) {
            repliesMap.set(comment.parentId, []);
          }
          repliesMap.get(comment.parentId)?.push({
            ...comment,
            isLiked: userLikes.includes(comment.id),
          });
        }
      });

      const structuredComments = topLevelComments.map((comment) => ({
        ...comment,
        replies: repliesMap.get(comment.id) || [],
        isLiked: userLikes.includes(comment.id),
      }));

      setComments(structuredComments);
      setLoading(false);
    });

    return unsubscribe;
  }, [contentType, contentId, user]);

  const createComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await addDoc(collection(db, 'comments'), {
        userId: user.uid,
        contentType,
        contentId,
        parentId: parentId || null,
        content: content.trim(),
        likesCount: 0,
        repliesCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success(parentId ? 'Reply posted!' : 'Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) {
      toast.error('Please sign in to edit comments');
      return;
    }

    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        content: content.trim(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to delete comments');
      return;
    }

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to like comments');
      return;
    }

    const commentRef = doc(db, 'comments', commentId);
    const likeRef = doc(db, 'users', user.uid, 'commentLikes', commentId);

    try {
      await runTransaction(db, async (transaction) => {
        const likeDoc = await transaction.get(likeRef);
        const commentDoc = await transaction.get(commentRef);

        if (!commentDoc.exists()) {
          throw 'Comment does not exist!';
        }

        const newLikesCount =
          (commentDoc.data().likesCount || 0) + (likeDoc.exists() ? -1 : 1);

        if (likeDoc.exists()) {
          transaction.delete(likeRef);
        } else {
          transaction.set(likeRef, { createdAt: serverTimestamp() });
        }

        transaction.update(commentRef, { likesCount: newLikesCount });
      });
    } catch (error) {
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
