import { useEffect, useRef, useState } from 'react';
import { Document, Page as PDFPage, pdfjs } from 'react-pdf';
import { PageFlip } from 'page-flip';
import { Loader2 } from 'lucide-react';

// PDF.js worker is already configured in MagazineReader
interface PageFlipViewerProps {
  pdfUrl?: string;
  imageUrls?: string[];
  onPageChange: (page: number) => void;
  currentPage: number;
  onDocumentLoad: ({ numPages }: { numPages: number }) => void;
}

/**
 * PageFlipViewer Component
 * Renders a PDF with realistic page-flip animation
 * Supports both touch/swipe (mobile) and click/drag (desktop)
 */
export const PageFlipViewer = ({ 
  pdfUrl,
  imageUrls,
  onPageChange, 
  currentPage,
  onDocumentLoad 
}: PageFlipViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const devicePixelRatio = window.devicePixelRatio || 1;
  const isImageBased = !!imageUrls;

  // Handle PDF load - convert pages to images for page-flip
  const onPDFLoadSuccess = async ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onDocumentLoad({ numPages });
    
    // Initialize canvas refs array
    canvasRefs.current = new Array(numPages).fill(null);
  };

  // Render individual PDF page to canvas, then convert to image
  const renderPageToImage = async (pageNum: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRefs.current[pageNum - 1];
      if (!canvas) {
        resolve('');
        return;
      }

      // Wait a bit for react-pdf to render the page
      setTimeout(() => {
        try {
          // Use PNG for lossless quality - critical for text clarity
          const imageUrl = canvas.toDataURL('image/png');
          resolve(imageUrl);
        } catch (error) {
          console.error(`Error converting page ${pageNum} to image:`, error);
          resolve('');
        }
      }, 150);
    });
  };

  // Handle image-based magazines (skip PDF conversion)
  useEffect(() => {
    if (imageUrls && imageUrls.length > 0) {
      setNumPages(imageUrls.length);
      setPageImages(imageUrls);
      onDocumentLoad({ numPages: imageUrls.length });
      setIsLoading(false);
    }
  }, [imageUrls, onDocumentLoad]);

  // Convert all PDF pages to images
  useEffect(() => {
    if (numPages > 0 && !isImageBased) {
      const convertPages = async () => {
        const images: string[] = [];
        
        for (let i = 1; i <= numPages; i++) {
          const imageUrl = await renderPageToImage(i);
          images.push(imageUrl);
        }
        
        setPageImages(images);
        setIsLoading(false);
      };

      // Small delay to ensure all canvases are rendered
      const timer = setTimeout(convertPages, 500);
      return () => clearTimeout(timer);
    }
  }, [numPages, isImageBased]);

  // Initialize PageFlip when images are ready
  useEffect(() => {
    if (!containerRef.current || pageImages.length === 0 || pageFlipRef.current) return;

    try {
      // Calculate responsive dimensions - maximize page size
      const containerWidth = containerRef.current.offsetWidth;
      const pageWidth = Math.min(containerWidth * 0.68, 1200); // Increased to 68% width, max 1200px
      const pageHeight = pageWidth * 1.414; // A4 ratio

      const pageFlip = new PageFlip(containerRef.current, {
        width: pageWidth,
        height: pageHeight,
        size: 'stretch',
        minWidth: 400,
        maxWidth: 1200,
        minHeight: 400,
        maxHeight: 1697,
        drawShadow: true,
        flippingTime: 1000,
        usePortrait: true,
        startZIndex: 0,
        autoSize: true,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
      });

      // Load pages into PageFlip
      pageFlip.loadFromImages(pageImages);

      // Listen for page flip events
      pageFlip.on('flip', (e: any) => {
        onPageChange(e.data + 1); // PageFlip uses 0-based index
      });

      pageFlipRef.current = pageFlip;

      // Handle window resize
      const handleResize = () => {
        if (pageFlipRef.current) {
          pageFlipRef.current.updateState();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (pageFlipRef.current) {
          pageFlipRef.current.destroy();
          pageFlipRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing PageFlip:', error);
      setIsLoading(false);
    }
  }, [pageImages, onPageChange]);

  // Handle external page navigation (from buttons)
  useEffect(() => {
    if (pageFlipRef.current && currentPage > 0) {
      const targetPage = currentPage - 1; // Convert to 0-based index
      if (pageFlipRef.current.getCurrentPageIndex() !== targetPage) {
        pageFlipRef.current.flip(targetPage, 'top');
      }
    }
  }, [currentPage]);

  return (
    <div className="relative w-full">
      {/* Hidden PDF renderer - converts pages to canvas (only for PDF-based magazines) */}
      {!isImageBased && pdfUrl && (
        <div className="absolute opacity-0 pointer-events-none -z-50">
          <Document
            file={pdfUrl}
            onLoadSuccess={onPDFLoadSuccess}
            loading={null}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <PDFPage
                key={`page-${i + 1}`}
                pageNumber={i + 1}
                canvasRef={(ref) => {
                  canvasRefs.current[i] = ref;
                }}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={3000 * devicePixelRatio}
                scale={2}
              />
            ))}
          </Document>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[600px] text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p className="text-lg">Preparing your magazine...</p>
          <p className="text-sm mt-2">{isImageBased ? 'Loading images...' : 'Creating page-flip experience'}</p>
        </div>
      )}

      {/* PageFlip Container */}
      <div 
        ref={containerRef} 
        className={`page-flip-container ${isLoading ? 'hidden' : 'flex justify-center items-center min-h-[600px] py-8'}`}
        style={{
          touchAction: 'pan-y', // Enable vertical scrolling but prevent horizontal
        }}
      />

      {/* Instructions for mobile users */}
      {!isLoading && (
        <div className="text-center mt-4 text-sm text-muted-foreground">
          <p className="hidden md:block">Click and drag to flip pages, or use the navigation buttons</p>
          <p className="md:hidden">Swipe to flip pages, or use the navigation buttons</p>
        </div>
      )}
    </div>
  );
};
