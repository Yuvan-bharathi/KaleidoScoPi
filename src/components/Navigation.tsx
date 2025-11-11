import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Sparkles, BookOpen, BookMarked, Users, Video, Info, User } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-warm p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              KaleidoScoPi
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/articles" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">Articles</span>
            </Link>
            <Link to="/magazine" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <BookMarked className="h-4 w-4" />
              <span className="font-medium">Magazine</span>
            </Link>
            <Link to="/community" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Users className="h-4 w-4" />
              <span className="font-medium">Community</span>
            </Link>
            <Link to="/videos" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Video className="h-4 w-4" />
              <span className="font-medium">Video Corner</span>
            </Link>
            <Link to="/about" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Info className="h-4 w-4" />
              <span className="font-medium">About</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-warm hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
