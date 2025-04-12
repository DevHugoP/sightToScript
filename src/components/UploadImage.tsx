
import { useState } from "react";
import { Upload, Camera, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
// Importez le service API mis à jour
import { extractFolderStructureFromImage } from "@/services/apiService";

interface UploadImageProps {
  onImageUpload: (imageUrl: string) => void;
  uploadedImage: string | null;
}

const UploadImage = ({ onImageUpload, uploadedImage }: UploadImageProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsProcessing(true);
    toast.info("Processing image, this may take a moment...");

    // Create a URL for the image file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        // Pass the image data to the parent component
        onImageUpload(e.target.result.toString());
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    toast.info("Camera functionality would be implemented here");
  };

  return (
    <Card className="bg-white shadow-md">
      <CardContent className="p-6">
        {!uploadedImage ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mx-auto flex flex-col items-center">
              <Image className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Folder Structure Image</h3>
              <p className="text-gray-500 mb-6">
                Upload an image showing a folder structure diagram or screenshot
              </p>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="flex items-center space-x-2"
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4" />
                  <span>Browse Files</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCameraClick}
                  className="flex items-center space-x-2"
                  disabled={isProcessing}
                >
                  <Camera className="h-4 w-4" />
                  <span>Use Camera</span>
                </Button>
              </div>
              
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
                disabled={isProcessing}
              />
              
              <p className="text-sm text-gray-500 mt-6">
                Drag & drop your image here, or use the buttons above
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Uploaded Image Preview</h2>
            <div className="border rounded-lg overflow-auto max-h-[500px]">
              <img 
                src={uploadedImage} 
                alt="Uploaded folder structure" 
                className="w-full h-auto"
              />
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => onImageUpload("")}
                disabled={isProcessing}
              >
                Upload a Different Image
              </Button>
              
              <Button disabled={isProcessing}>
                {isProcessing ? "Processing Image..." : "Continue"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadImage;
