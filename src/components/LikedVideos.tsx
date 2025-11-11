import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const LikedVideos = () => {
  const { user } = useFirebaseAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const likedVideoIds = userData.likedVideos || [];

          if (likedVideoIds.length > 0) {
            const videosRef = collection(db, 'videos');
            const q = query(videosRef, where('__name__', 'in', likedVideoIds));
            const querySnapshot = await getDocs(q);
            const videosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVideos(videosData);
          }
        }
      }
      setLoading(false);
    };

    fetchLikedVideos();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {videos.length === 0 ? (
        <p>You haven't liked any videos yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map(video => (
            <Link to={`/video/${video.id}`} key={video.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={video.thumbnailUrl} alt={video.title} className="rounded-md" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
