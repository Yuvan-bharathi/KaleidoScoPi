import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Users, Target } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-warm rounded-2xl mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About e-STEMagazine</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We believe every child deserves access to quality STEM education rooted in their cultural heritage. 
            e-STEMagazine bridges modern science with timeless Indic wisdom, creating curious, confident young minds.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-muted-foreground">
              To make STEM learning accessible, engaging, and culturally relevant for every Indian child
            </p>
          </Card>

          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-2xl mb-4">
              <Heart className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Values</h3>
            <p className="text-muted-foreground">
              Curiosity, cultural pride, inclusivity, and the joy of learning through discovery
            </p>
          </Card>

          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
              <Users className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Community</h3>
            <p className="text-muted-foreground">
              A growing family of young learners, parents, and educators across India
            </p>
          </Card>
        </div>

        {/* Story Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                e-STEMagazine was born from a simple observation: children are naturally curious about science, 
                but often struggle to connect with content that doesn't reflect their cultural context.
              </p>
              <p>
                We asked ourselves: What if we could show kids that India has always been at the forefront of 
                scientific discovery? What if learning about space could include stories of Aryabhata? What if 
                understanding geometry could start with the patterns in their grandmother's rangoli?
              </p>
              <p>
                Today, e-STEMagazine serves thousands of young minds, blending cutting-edge STEM concepts with 
                the rich heritage of Indic knowledge. We're building a generation that's proud of where they 
                come from and excited about where they're going.
              </p>
            </div>
          </Card>
        </div>

        {/* What We Offer */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">📚 Curated Articles</h3>
              <p className="text-muted-foreground">
                Age-appropriate STEM content that connects modern science with Indic culture and traditions
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">🎥 Educational Videos</h3>
              <p className="text-muted-foreground">
                Animated explainers and AI-curated content that makes learning fun and accessible
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">💬 Interactive Community</h3>
              <p className="text-muted-foreground">
                Safe space for children to share thoughts, ask questions, and learn from peers
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">🎯 Free Access</h3>
              <p className="text-muted-foreground">
                All content is completely free, because quality education should be accessible to everyone
              </p>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="max-w-3xl mx-auto p-8 md:p-12 bg-gradient-to-br from-primary/5 to-secondary/5 text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have questions, suggestions, or want to contribute? We'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:contact@estemagazine.com" className="text-primary font-medium hover:underline">
              contact@estemagazine.com
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
