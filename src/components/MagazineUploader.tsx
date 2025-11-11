import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

export const MagazineUploader = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issueNumber: '',
    publishedDate: '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Filter for images only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: 'Invalid files',
        description: 'Only image files are allowed',
        variant: 'destructive',
      });
    }

    setSelectedFiles(imageFiles);
    
    // Create preview URLs
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the removed URL
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one image',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title) {
      toast({
        title: 'Missing title',
        description: 'Please enter a magazine title',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload all images to storage
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_page_${index + 1}.${fileExt}`;
        const filePath = `${formData.title.replace(/\s+/g, '_')}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('magazine-images')
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('magazine-images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Create magazine record
      const { error: insertError } = await supabase
        .from('magazines')
        .insert({
          title: formData.title,
          description: formData.description || null,
          issue_number: formData.issueNumber ? parseInt(formData.issueNumber) : null,
          published_date: formData.publishedDate || null,
          format: 'images',
          image_urls: imageUrls,
          total_pages: imageUrls.length,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success!',
        description: 'Magazine created successfully',
      });

      // Reset form
      setSelectedFiles([]);
      setPreviewUrls([]);
      setFormData({
        title: '',
        description: '',
        issueNumber: '',
        publishedDate: '',
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Image-Based Magazine</h2>
      
      <div className="space-y-4">
        {/* Magazine Info */}
        <div>
          <Label htmlFor="title">Magazine Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter magazine title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter magazine description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="issueNumber">Issue Number</Label>
            <Input
              id="issueNumber"
              type="number"
              value={formData.issueNumber}
              onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
              placeholder="e.g., 1"
            />
          </div>

          <div>
            <Label htmlFor="publishedDate">Publication Date</Label>
            <Input
              id="publishedDate"
              type="date"
              value={formData.publishedDate}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <Label htmlFor="images">Magazine Pages (Images) *</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Select multiple images in order (they will be displayed as pages)
          </p>
        </div>

        {/* Preview */}
        {previewUrls.length > 0 && (
          <div>
            <Label>Selected Pages ({previewUrls.length})</Label>
            <div className="grid grid-cols-4 gap-4 mt-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Page {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
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
              Create Magazine
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
