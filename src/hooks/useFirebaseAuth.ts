/**
 * Firebase Authentication Hook
 * Manages user authentication state and provides auth methods
 */
import { useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign up a new user with email and password
   */
  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { name?: string; age?: number; role?: string }
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (metadata?.name) {
        await updateProfile(userCredential.user, {
          displayName: metadata.name
        });
      }

      // Create user profile document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName: metadata?.name || '',
        role: metadata?.role || 'student',
        age: metadata?.age || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  /**
   * Sign in an existing user
   */
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};
