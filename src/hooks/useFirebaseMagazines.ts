import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Magazine {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  issue_number?: number;
  published_date?: string;
  format?: string;
  image_urls?: string[];
  pdf_url?: string;
  total_pages?: number;
  created_at: string;
  updated_at: string;
}

export const useFirebaseMagazines = () => {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMagazines = async () => {
    try {
      const magazinesRef = collection(db, 'magazines');
      const q = query(magazinesRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const magazinesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at,
      })) as Magazine[];
      
      setMagazines(magazinesData);
    } catch (error) {
      console.error('Error fetching magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMagazineById = async (id: string): Promise<Magazine | null> => {
    try {
      const docRef = doc(db, 'magazines', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          created_at: docSnap.data().created_at?.toDate?.()?.toISOString() || docSnap.data().created_at,
          updated_at: docSnap.data().updated_at?.toDate?.()?.toISOString() || docSnap.data().updated_at,
        } as Magazine;
      }
      return null;
    } catch (error) {
      console.error('Error fetching magazine:', error);
      return null;
    }
  };

  const createMagazine = async (magazineData: Omit<Magazine, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const docRef = await addDoc(collection(db, 'magazines'), {
        ...magazineData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  };

  useEffect(() => {
    fetchMagazines();
  }, []);

  return {
    magazines,
    loading,
    fetchMagazines,
    getMagazineById,
    createMagazine,
  };
};
