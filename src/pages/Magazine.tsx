import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, FileText } from "lucide-react";
import { useFirebaseMagazines } from "@/hooks/useFirebaseMagazines";
import { useNavigate } from "react-router-dom";
import { MagazineUploaderFirebase } from "@/components/MagazineUploaderFirebase";

const Magazine = () => {
  const navigate = useNavigate();
  const { magazines, loading } = useFirebaseMagazines();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">Loading magazines...</p>
        </div>
      </div>
    );
  }

  if (magazines.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-8">No magazines available yet. Upload one to get started!</p>
            </div>
            <MagazineUploaderFirebase />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-warm bg-clip-text text-transparent">
              Magazine Library
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our collection of digital magazines
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-12">
            <MagazineUploaderFirebase />
          </div>

          {/* Magazine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {magazines.map((magazine) => (
              <Card 
                key={magazine.id} 
                className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80"
              >
                {/* Cover Image */}
                {magazine.cover_image_url ? (
                  <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <img 
                      src={magazine.cover_image_url} 
                      alt={magazine.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-primary/40" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">
                    {magazine.title}
                  </h2>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {magazine.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    {magazine.issue_number && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>Issue #{magazine.issue_number}</span>
                      </div>
                    )}
                    {magazine.published_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(magazine.published_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full bg-gradient-warm hover:opacity-90 transition-opacity"
                    onClick={() => navigate(`/magazine/${magazine.id}`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Magazine
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Magazine;
