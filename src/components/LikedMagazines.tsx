import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const LikedMagazines = () => {
  const { user } = useFirebaseAuth();
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedMagazines = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const likedMagazineIds = userData.likedMagazines || [];

          if (likedMagazineIds.length > 0) {
            const magazinesRef = collection(db, 'magazines');
            const q = query(magazinesRef, where('__name__', 'in', likedMagazineIds));
            const querySnapshot = await getDocs(q);
            const magazinesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMagazines(magazinesData);
          }
        }
      }
      setLoading(false);
    };

    fetchLikedMagazines();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {magazines.length === 0 ? (
        <p>You haven't liked any magazines yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {magazines.map(magazine => (
            <Link to={`/magazine/${magazine.id}`} key={magazine.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{magazine.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={magazine.coverUrl} alt={magazine.title} className="rounded-md" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedMagazines;
