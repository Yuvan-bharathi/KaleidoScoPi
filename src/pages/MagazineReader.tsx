import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Maximize2, Minimize2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { pdfjs } from "react-pdf";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { PageFlipViewer } from "@/components/PageFlipViewer";
import { CommentSection } from "@/components/CommentSection";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useFirebaseMagazines } from "@/hooks/useFirebaseMagazines";

// Configure PDF.js worker using Vite's URL import
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const MagazineReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const { getMagazineById } = useFirebaseMagazines();
  const [magazine, setMagazine] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMagazine();
    }
  }, [id]);

  const loadMagazine = async () => {
    if (!id) {
      navigate('/magazine');
      return;
    }

    setLoading(true);
    try {
      const data = await getMagazineById(id);
      
      if (!data) {
        toast({
          title: "Error",
          description: "Magazine not found",
          variant: "destructive"
        });
        navigate('/magazine');
        return;
      }

      setMagazine(data);
    } catch (error) {
      console.error('Error loading magazine:', error);
      toast({
        title: "Error",
        description: "Failed to load magazine",
        variant: "destructive"
      });
      navigate('/magazine');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: magazine?.title,
        text: magazine?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Magazine link has been copied to clipboard"
      });
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  if (loading || !magazine) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">Loading magazine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Desktop: Split screen | Mobile: Stacked */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6 gap-2"
            onClick={() => navigate('/magazine')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>

          {/* Magazine Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{magazine.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Vertical Stack Layout: Magazine at top, Comments below */}
          <div className="flex flex-col gap-8">
            {/* Magazine Viewer */}
            <div>
              {/* Backdrop for expanded mode */}
              {isExpanded && (
                <div 
                  className="fixed inset-0 bg-black/80 z-40" 
                  onClick={() => setIsExpanded(false)}
                />
              )}
              
              <Card className={`${isExpanded ? 'fixed inset-4 z-50 overflow-y-auto flex flex-col max-h-screen' : 'overflow-hidden'} bg-card`}>
                <div className="relative flex-1 flex flex-col">
                  {/* Controls */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Page Flip Viewer */}
                  <div className={`bg-muted/20 p-2 md:p-4 ${isExpanded ? 'flex-1 overflow-y-auto' : ''}`}>
                    <PageFlipViewer
                      pdfUrl={magazine.pdf_url || undefined}
                      imageUrls={magazine.image_urls || undefined}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      onDocumentLoad={onDocumentLoadSuccess}
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between p-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={goToPrevPage}
                      disabled={currentPage <= 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="text-sm font-medium">
                      Page {currentPage} of {numPages || magazine.total_pages || 1}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage >= (numPages || magazine.total_pages || 1)}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Magazine Description */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
              <h2 className="text-xl font-bold mb-3">About This Issue</h2>
              <p className="text-foreground leading-relaxed text-sm">{magazine.description}</p>
              {magazine.issue_number && (
                <p className="text-xs text-muted-foreground mt-3">Issue #{magazine.issue_number}</p>
              )}
            </Card>

            {/* Comments Section */}
            <div>
              <CommentSection
                contentType="magazine"
                contentId={id!}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagazineReader;
