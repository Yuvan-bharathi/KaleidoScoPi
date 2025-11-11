import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Sparkles, Rocket, Microscope, Lightbulb, Flower2, ArrowRight, Heart, MessageSquare } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const categories = [
    { icon: Rocket, name: "Space", color: "bg-gradient-sky", count: "12 Articles" },
    { icon: Microscope, name: "Science", color: "bg-gradient-warm", count: "18 Articles" },
    { icon: Lightbulb, name: "Innovation", color: "bg-gradient-hero", count: "15 Articles" },
    { icon: Flower2, name: "Culture", color: "bg-primary", count: "10 Articles" },
  ];

  const featuredArticles = [
    {
      title: "Journey to Mars: India's Space Dreams",
      category: "Space",
      excerpt: "Discover how Indian scientists are planning missions to Mars and beyond...",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400",
      likes: 124
    },
    {
      title: "The Magic of Rangoli Mathematics",
      category: "Culture",
      excerpt: "Learn how ancient Indian art forms teach us about geometry and patterns...",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
      likes: 98
    },
    {
      title: "Young Inventors: Solar Solutions",
      category: "Innovation",
      excerpt: "Meet children who are creating amazing solar-powered inventions...",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
      likes: 156
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
                <span className="text-sm font-medium text-accent-foreground">STEM Learning with Indic Values</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Explore, Learn, and Grow with{" "}
                <span className="bg-gradient-warm bg-clip-text text-transparent">
                  KaleidoScoPi
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                An interactive digital magazine for curious minds aged 8-15. Discover amazing STEM articles, 
                watch educational videos, and join a community of young thinkers rooted in Indic culture.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/articles">
                  <Button size="lg" className="bg-gradient-warm hover:opacity-90 transition-opacity shadow-soft">
                    Start Reading Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroBanner} 
                alt="Children exploring STEM with Indian culture" 
                className="rounded-2xl shadow-soft w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore by Category</h2>
            <p className="text-muted-foreground">Dive into topics that spark your curiosity</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 hover:shadow-soft transition-all cursor-pointer group border-2 hover:border-primary"
                >
                  <div className={`${category.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Stories</h2>
              <p className="text-muted-foreground">Handpicked articles just for you</p>
            </div>
            <Link to="/articles">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer hover:shadow-soft transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{article.excerpt}</p>
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
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4 text-center text-white">
          <MessageSquare className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Share your thoughts, comment on articles, and connect with other young learners from across India
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="shadow-lg">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-warm p-2 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">KaleidoScoPi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                STEM learning infused with Indic culture and values
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/articles" className="hover:text-primary transition-colors">Articles</Link></li>
                <li><Link to="/videos" className="hover:text-primary transition-colors">Videos</Link></li>
                <li><Link to="/community" className="hover:text-primary transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">Our Mission</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">Team</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 KaleidoScoPi. All rights reserved. Made with ❤️ for young Indic minds.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
