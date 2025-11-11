import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, Eye } from "lucide-react";

const Videos = () => {
  const videos = [
    {
      id: 1,
      title: "Aryabhata: India's First Mathematician",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
      duration: "8:45",
      views: "1.2K",
      category: "Culture"
    },
    {
      id: 2,
      title: "How Rockets Work: ISRO Edition",
      thumbnail: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400",
      duration: "12:30",
      views: "2.5K",
      category: "Space"
    },
    {
      id: 3,
      title: "Solar Energy Experiments for Kids",
      thumbnail: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
      duration: "6:20",
      views: "980",
      category: "Innovation"
    },
    {
      id: 4,
      title: "The Science Behind Diyas",
      thumbnail: "https://images.unsplash.com/photo-1605481593392-3adeb1e29f4c?w=400",
      duration: "5:15",
      views: "1.8K",
      category: "Science"
    },
    {
      id: 5,
      title: "Ancient Indian Astronomy",
      thumbnail: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
      duration: "10:50",
      views: "3.1K",
      category: "Space"
    },
    {
      id: 6,
      title: "Making Natural Colors from Flowers",
      thumbnail: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400",
      duration: "7:30",
      views: "1.5K",
      category: "Science"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-sky/20 px-4 py-2 rounded-full mb-4">
            <Play className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary-foreground">Indic Video Corner</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Educational Videos</h1>
          <p className="text-lg text-muted-foreground">
            Watch AI-curated and animated explainer videos about Indic culture and science
          </p>
        </div>

        {/* Featured Video */}
        <Card className="overflow-hidden mb-12 group cursor-pointer">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600"
                alt="Featured video"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                <div className="bg-white rounded-full p-6 group-hover:scale-110 transition-transform">
                  <Play className="h-12 w-12 text-primary fill-primary" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                15:30
              </div>
            </div>
            <div className="p-6 flex flex-col justify-center">
              <span className="text-sm font-medium text-primary mb-2">🌟 Featured Video</span>
              <h2 className="text-3xl font-bold mb-4">The Genius of Ancient Indian Mathematics</h2>
              <p className="text-muted-foreground mb-6">
                Explore how ancient Indian mathematicians invented zero, decimal system, and complex astronomical calculations that changed the world forever.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>4.2K views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>15:30</span>
                </div>
              </div>
              <Button size="lg" className="bg-gradient-warm gap-2 w-fit">
                <Play className="h-5 w-5" />
                Watch Now
              </Button>
            </div>
          </div>
        </Card>

        {/* Video Grid */}
        <div>
          <h3 className="text-2xl font-bold mb-6">More Videos</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden group cursor-pointer hover:shadow-soft transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="bg-white rounded-full p-4 group-hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                      <Play className="h-8 w-8 text-primary fill-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                    {video.duration}
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
                      {video.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{video.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{video.duration}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Age Filter Notice */}
        <Card className="mt-12 p-6 bg-accent/10 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="bg-accent/20 p-3 rounded-lg">
              <Play className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Age-Appropriate Content</h4>
              <p className="text-sm text-muted-foreground">
                All videos are curated with age-appropriate recommendations. Content is moderated to ensure safe, educational viewing for children aged 8-15 years.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Videos;
