import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Heart, BookmarkPlus, ArrowRight } from "lucide-react";

const Articles = () => {
  const articles = [
    {
      id: 1,
      title: "Journey to Mars: India's Space Dreams",
      category: "Space",
      excerpt: "Discover how Indian scientists are planning missions to Mars and beyond. Learn about ISRO's achievements and future missions...",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400",
      likes: 124,
      ageGroup: "10-15"
    },
    {
      id: 2,
      title: "The Magic of Rangoli Mathematics",
      category: "Culture",
      excerpt: "Learn how ancient Indian art forms teach us about geometry and patterns. Discover the mathematical beauty in traditional designs...",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
      likes: 98,
      ageGroup: "8-12"
    },
    {
      id: 3,
      title: "Young Inventors: Solar Solutions",
      category: "Innovation",
      excerpt: "Meet children who are creating amazing solar-powered inventions. Get inspired to build your own eco-friendly projects...",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
      likes: 156,
      ageGroup: "10-15"
    },
    {
      id: 4,
      title: "Water Science in Ancient India",
      category: "Science",
      excerpt: "Explore how ancient Indians mastered water management through stepwells and irrigation systems...",
      image: "https://images.unsplash.com/photo-1531837763904-5d3cb2632ea3?w=400",
      likes: 87,
      ageGroup: "8-12"
    },
    {
      id: 5,
      title: "Coding with Sanskrit Logic",
      category: "Innovation",
      excerpt: "Discover the connection between Sanskrit grammar and modern computer programming...",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
      likes: 142,
      ageGroup: "12-15"
    },
    {
      id: 6,
      title: "Stars and Constellations in Vedic Astronomy",
      category: "Space",
      excerpt: "Learn about ancient Indian knowledge of stars and how it compares to modern astronomy...",
      image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
      likes: 203,
      ageGroup: "10-15"
    }
  ];

  const categories = ["All", "Space", "Science", "Innovation", "Culture"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Articles</h1>
          <p className="text-lg text-muted-foreground">Discover amazing STEM stories infused with Indic wisdom</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search articles by keyword, topic, or age group..." 
              className="pl-10 h-12"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Button 
                key={cat}
                variant={cat === "All" ? "default" : "outline"}
                className={cat === "All" ? "bg-gradient-warm" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden group cursor-pointer hover:shadow-soft transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Age {article.ageGroup}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                    <span>{article.likes} likes</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Articles;
