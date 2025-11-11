import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebaseMagazines } from '@/hooks/useFirebaseMagazines';

export const MagazineUploaderFirebase = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const { createMagazine } = useFirebaseMagazines();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error('Only image files are allowed');
    }

    setSelectedFiles(imageFiles);
    
    // Create preview URLs
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleUpload = async () => {
    if (!title || selectedFiles.length === 0) {
      toast.error('Please provide a title and select at least one image');
      return;
    }

    setIsUploading(true);
    try {
      // Upload all images to Firebase Storage
      const uploadPromises = selectedFiles.map((file, index) => {
        const storageRef = ref(storage, `magazine-images/${Date.now()}-${index}-${file.name}`);
        return uploadBytesResumable(storageRef, file);
      });

      // Wait for all uploads to complete
      const uploadSnapshots = await Promise.all(uploadPromises);
      
      // Get download URLs
      const imageUrls = await Promise.all(
        uploadSnapshots.map(snapshot => getDownloadURL(snapshot.ref))
      );

      // Use first image as cover
      const coverImageUrl = imageUrls[0];

      // Create magazine document in Firestore
      const { error } = await createMagazine({
        title,
        description: description || undefined,
        cover_image_url: coverImageUrl,
        issue_number: issueNumber ? parseInt(issueNumber) : undefined,
        published_date: publicationDate || undefined,
        format: 'images',
        image_urls: imageUrls,
        total_pages: imageUrls.length,
      });

      if (error) {
        throw error;
      }

      toast.success('Magazine uploaded successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setIssueNumber('');
      setPublicationDate('');
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload magazine');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Magazine (Images)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter magazine title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter magazine description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issueNumber">Issue Number</Label>
            <Input
              id="issueNumber"
              type="number"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              placeholder="e.g., 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicationDate">Publication Date</Label>
            <Input
              id="publicationDate"
              type="date"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="images">Magazine Pages (Images)</Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground">
            Select multiple images for magazine pages. Images will be displayed in the order selected.
          </p>
        </div>

        {previewUrls.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Images ({previewUrls.length})</Label>
            <div className="grid grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                    Page {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || !title || selectedFiles.length === 0}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Magazine
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
