import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Flag, Send, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFirebaseCommunityPosts } from "@/hooks/useFirebaseCommunityPosts";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Community = () => {
  const [shareContent, setShareContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { posts: dbPosts, loading, createPost, likePost } = useFirebaseCommunityPosts();
  const { isAuthenticated, user } = useFirebaseAuth();

  // Static example thoughts (for display alongside database posts)
  const staticThoughts = [
    {
      id: 1,
      author: "Ananya K.",
      role: "Kid",
      content: "I tried the solar panel experiment from the Innovation article! It actually worked and now I want to become a solar engineer when I grow up! 🌞",
      likes: 45,
      comments: 8,
      time: "2 hours ago"
    },
    {
      id: 2,
      author: "Rohan M.",
      role: "Kid",
      content: "The article about Vedic astronomy was amazing! I never knew ancient Indians knew so much about stars. Now I understand why my grandfather talks about nakshatras.",
      likes: 32,
      comments: 5,
      time: "5 hours ago"
    },
    {
      id: 3,
      author: "Priya S.",
      role: "Kid",
      content: "Can someone explain more about the connection between Sanskrit and coding? I'm learning Python and this sounds super interesting!",
      likes: 28,
      comments: 12,
      time: "1 day ago"
    },
    {
      id: 4,
      author: "Mrs. Sharma",
      role: "Parent",
      content: "As a parent, I'm so grateful for KaleidoScoPi! My daughter has been reading every article and asking me scientific questions all day. Keep up the great work!",
      likes: 67,
      comments: 15,
      time: "2 days ago"
    }
  ];

  /**
   * Merge database posts with static posts and sort by creation time
   */
  const allThoughts = useMemo(() => {
    const dbPostsFormatted = dbPosts.map(post => ({
      id: post.id,
      author: post.author_name,
      role: post.author_role,
      content: post.content,
      likes: post.likes,
      comments: 0,
      time: new Date(post.created_at).toLocaleString(),
      isFromDB: true,
    }));

    const staticWithFlag = staticThoughts.map(t => ({ ...t, isFromDB: false }));
    
    return [...dbPostsFormatted, ...staticWithFlag].sort((a, b) => {
      if (a.isFromDB && !b.isFromDB) return -1;
      if (!a.isFromDB && b.isFromDB) return 1;
      return 0;
    });
  }, [dbPosts]);

  /**
   * Handle share button click - create new community post
   */
  const handleShare = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to share your thoughts");
      navigate("/auth");
      return;
    }

    if (!shareContent.trim()) {
      toast.error("Please write something before sharing");
      return;
    }

    if (shareContent.length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    if (shareContent.length > 1000) {
      toast.error("Please keep your thought under 1000 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const userName = user?.displayName || user?.email?.split('@')[0] || "Anonymous";
      await createPost(shareContent, userName, "Student");
      toast.success("Your thought has been shared!");
      setShareContent("");
    } catch (error) {
      toast.error("An error occurred while sharing");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle like button click
   */
  const handleLike = async (thoughtId: string, isFromDB: boolean) => {
    if (!isFromDB) {
      toast("This is an example post");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to like posts");
      return;
    }

    await likePost(thoughtId);
    toast.success("Liked!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Wall</h1>
              <p className="text-lg text-muted-foreground">Share your thoughts and connect with fellow learners</p>
            </div>

            {/* Share Your Thought */}
            <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <h3 className="font-semibold text-lg mb-4">Share Your Thoughts</h3>
              <Textarea 
                placeholder="What did you learn today? Share your experiments, questions, or ideas..."
                className="mb-4 min-h-[120px]"
                value={shareContent}
                onChange={(e) => setShareContent(e.target.value)}
                disabled={isSubmitting}
                maxLength={1000}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {shareContent.length}/1000 characters
                </p>
                <Button 
                  className="bg-gradient-warm gap-2"
                  onClick={handleShare}
                  disabled={isSubmitting || !shareContent.trim()}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sharing..." : "Share"}
                </Button>
              </div>
            </Card>

            {/* Community Thoughts */}
            <div className="space-y-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                allThoughts.map((thought) => (
                  <Card key={thought.id} className="p-6 hover:shadow-card transition-shadow">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 bg-gradient-warm">
                        <AvatarFallback className="bg-gradient-warm text-white font-semibold">
                          {thought.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{thought.author}</h4>
                              <span className="text-xs bg-primary/20 text-primary-foreground px-2 py-0.5 rounded-full">
                                {thought.role}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{thought.time}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-foreground mb-4 leading-relaxed">{thought.content}</p>
                        
                        <div className="flex items-center gap-6">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2 text-muted-foreground hover:text-primary"
                            onClick={() => handleLike(thought.id.toString(), thought.isFromDB)}
                          >
                            <Heart className="h-4 w-4" />
                            <span>{thought.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                            <MessageSquare className="h-4 w-4" />
                            <span>{thought.comments} replies</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Thoughts
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Guidelines */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
              <h3 className="font-bold text-xl mb-4">Community Guidelines</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>Be kind and respectful to everyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>Share your ideas and questions freely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>Help and encourage fellow learners</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">✗</span>
                  <span>No mean comments or bullying</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">✗</span>
                  <span>Keep personal information private</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                All comments are moderated by our team to ensure a safe environment.
              </p>
            </Card>

            {/* Featured Story */}
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
              <h3 className="font-bold text-xl mb-3">📝 Featured Story</h3>
              <p className="text-sm mb-4">
                "My Science Fair Project on Solar Cookers" by Aisha R., age 14
              </p>
              <Button variant="outline" size="sm" className="rounded-full w-full">
                Read Story
              </Button>
            </Card>

            {/* Join Badge */}
            <Card className="p-6 bg-gradient-to-br from-primary to-accent text-white">
              <h3 className="font-bold text-xl mb-3">Join Our Community!</h3>
              <p className="text-sm mb-4 opacity-90">
                Sign up to share your stories and connect with young explorers like you!
              </p>
              <Link to="/auth">
                <Button variant="secondary" size="sm" className="rounded-full w-full">
                  Sign Up Now
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
