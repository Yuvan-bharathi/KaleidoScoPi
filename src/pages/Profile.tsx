import { Navigation } from "@/components/Navigation";
import UserProfile from "@/components/UserProfile";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LikedMagazines from "@/components/LikedMagazines";
import LikedArticles from "@/components/LikedArticles";
import LikedVideos from "@/components/LikedVideos";
import UserComments from "@/components/UserComments";

const Profile = () => {
  const { user } = useFirebaseAuth();

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mt-8">
          {user ? (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <UserProfile user={user} />
              </div>
              <div className="md:w-2/3">
                <Tabs defaultValue="liked-magazines">
                  <TabsList>
                    <TabsTrigger value="liked-magazines">Liked Magazines</TabsTrigger>
                    <TabsTrigger value="liked-articles">Liked Articles</TabsTrigger>
                    <TabsTrigger value="liked-videos">Liked Videos</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="liked-magazines">
                    <LikedMagazines />
                  </TabsContent>
                  <TabsContent value="liked-articles">
                    <LikedArticles />
                  </TabsContent>
                  <TabsContent value="liked-videos">
                    <LikedVideos />
                  </TabsContent>
                  <TabsContent value="comments">
                    <UserComments />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
