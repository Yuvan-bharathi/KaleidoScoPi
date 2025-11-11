import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { toast } from 'sonner';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_role: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export const useFirebaseCommunityPosts = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const postsRef = collection(db, 'community_posts');
    const q = query(postsRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at,
      })) as CommunityPost[];
      
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load community posts');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createPost = async (content: string, authorName: string, authorRole: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    try {
      await addDoc(collection(db, 'community_posts'), {
        user_id: user.uid,
        content,
        author_name: authorName,
        author_role: authorRole,
        likes: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const updatePost = async (postId: string, content: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to update a post');
      return;
    }

    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        content,
        updated_at: Timestamp.now(),
      });
      
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const deletePost = async (postId: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to delete a post');
      return;
    }

    try {
      await deleteDoc(doc(db, 'community_posts', postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const likePost = async (postId: string) => {
    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        likes: increment(1),
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const refetch = async () => {
    setLoading(true);
    const postsRef = collection(db, 'community_posts');
    const q = query(postsRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const postsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at,
    })) as CommunityPost[];
    
    setPosts(postsData);
    setLoading(false);
  };

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    likePost,
    refetch,
  };
};
