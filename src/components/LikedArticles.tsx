import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const LikedArticles = () => {
  const { user } = useFirebaseAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedArticles = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const likedArticleIds = userData.likedArticles || [];

          if (likedArticleIds.length > 0) {
            const articlesRef = collection(db, 'articles');
            const q = query(articlesRef, where('__name__', 'in', likedArticleIds));
            const querySnapshot = await getDocs(q);
            const articlesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArticles(articlesData);
          }
        }
      }
      setLoading(false);
    };

    fetchLikedArticles();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {articles.length === 0 ? (
        <p>You haven't liked any articles yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map(article => (
            <Link to={`/article/${article.id}`} key={article.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{article.snippet}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedArticles;
