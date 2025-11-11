import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const UserComments = () => {
  const { user } = useFirebaseAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserComments = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userComments = userData.comments || [];

          const commentsWithMagazineTitles = await Promise.all(
            userComments.map(async (comment: any) => {
              const magazineDocRef = doc(db, 'magazines', comment.magazineId);
              const magazineDocSnap = await getDoc(magazineDocRef);
              const magazineData = magazineDocSnap.data();
              return {
                ...comment,
                magazineTitle: magazineData?.title || 'Unknown Magazine',
              };
            })
          );
          setComments(commentsWithMagazineTitles);
        }
      }
      setLoading(false);
    };

    fetchUserComments();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {comments.length === 0 ? (
        <p>You haven't made any comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>
                  <Link to={`/magazine/${comment.magazineId}`}>
                    {comment.magazineTitle}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{comment.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserComments;
