import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { useFirebaseAuth } from './useFirebaseAuth';
import { toast } from 'sonner';

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorRole: string;
  content: string;
  likes: number;
  createdAt: any;
  updatedAt: any;
}

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebaseAuth();

  useEffect(() => {
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CommunityPost[];
      setPosts(postsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createPost = async (content: string, authorName: string, authorRole: string) => {
    if (!user) {
      toast.error('Must be authenticated to create a post');
      return;
    }

    try {
      await addDoc(collection(db, 'community_posts'), {
        userId: user.uid,
        authorName,
        authorRole,
        content,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Post created!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const updatePost = async (postId: string, content: string) => {
    if (!user) {
      toast.error('Must be authenticated to update a post');
      return;
    }

    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        content,
        updatedAt: serverTimestamp(),
      });
      toast.success('Post updated');
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error('Must be authenticated to delete a post');
      return;
    }

    try {
      await deleteDoc(doc(db, 'community_posts', postId));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const likePost = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        likes: increment(1),
      });
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    likePost,
  };
};
