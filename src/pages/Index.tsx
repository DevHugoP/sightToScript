import { useState, useEffect } from "react";
import UploadImage from "@/components/UploadImage";
import ViewStructure from "@/components/ViewStructure";
import GenerateCommands from "@/components/GenerateCommands";
import MyStructures from "@/components/MyStructures";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderStructure } from "@/types/types";
import { toast } from "sonner";
import {
  ArrowDown,
  ChevronDown,
  Image,
  Code,
  FolderTree,
  Terminal,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { extractFolderStructureFromImage } from "@/services/apiService";

const Index = () => {
  const [currentTab, setCurrentTab] = useState("hero");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [folderStructure, setFolderStructure] = useState<FolderStructure | null>(null);
  const [editedStructure, setEditedStructure] = useState<FolderStructure | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  // Effect to sync editedStructure with folderStructure when folderStructure changes
  useEffect(() => {
    if (folderStructure && !editedStructure) {
      setEditedStructure(folderStructure);
    }
  }, [folderStructure, editedStructure]);

  // Effect to check for loaded structure from history page
  useEffect(() => {
    const loadedStructureJSON = sessionStorage.getItem("loadedStructure");
    if (loadedStructureJSON) {
      try {
        const loadedStructure = JSON.parse(loadedStructureJSON);
        setFolderStructure(loadedStructure);
        setEditedStructure(loadedStructure);
        setCurrentTab("try");
        // Clear from session storage to prevent reloading on refresh
        sessionStorage.removeItem("loadedStructure");
      } catch (error) {
        console.error("Error parsing loaded structure:", error);
      }
    }
  }, []);

  const handleImageUpload = async (imageUrl: string) => {
    if (!imageUrl) {
      setUploadedImage(null);
      return;
    }
    
    setUploadedImage(imageUrl);
    setIsProcessing(true);
    
    try {
      // Process the image with AI to extract folder structure
      const extractedStructure = await extractFolderStructureFromImage(imageUrl);
      
      if (extractedStructure) {
        setFolderStructure(extractedStructure);
        setEditedStructure(extractedStructure);
        setCurrentTab("try");
        toast.success("Folder structure successfully extracted!");
      } else {
        toast.error("Failed to extract folder structure. Please try again or use a clearer image.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("An error occurred while processing the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStructureChange = (newStructure: FolderStructure) => {
    setEditedStructure(newStructure);
  };

  const handleLoadSavedStructure = (structure: FolderStructure) => {
    setFolderStructure(structure);
    setEditedStructure(structure);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="hero">Home</TabsTrigger>
            <TabsTrigger value="try">Try It</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-16">
            <section className="text-center py-16">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Turn Folder <span className="text-blue-600">Images</span> Into <span className="text-blue-600">Real Structure</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Upload an image of a folder structure, and we'll instantly generate the commands to create it on your system.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <Button 
                    size="lg" 
                    onClick={() => setCurrentTab("try")}
                    className="gap-2"
                  >
                    Try it now <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>

            <section className="py-16 bg-gradient-to-b from-white to-blue-50 rounded-3xl">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                    <CardHeader className="text-center pb-2">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle>1. Upload</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p>Take a screenshot or photo of any folder structure and upload it to our system.</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                    <CardHeader className="text-center pb-2">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderTree className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle>2. Edit</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p>Review and customize the detected folder structure with our intuitive editor.</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                    <CardHeader className="text-center pb-2">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Terminal className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle>3. Generate</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p>Generate the exact commands needed to recreate the structure on your system.</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center mt-12">
                  <Button 
                    size="lg" 
                    onClick={() => setCurrentTab("try")}
                    className="gap-2"
                  >
                    Try it yourself <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>

            <section className="py-16">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
                
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="flex gap-4">
                    <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Code className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Accurate Recognition</h3>
                      <p className="text-gray-600">Our advanced AI accurately recognizes folder structures from images, even with imperfect captures.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-purple-100 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Code className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Multiple Output Formats</h3>
                      <p className="text-gray-600">Generate commands for Windows (CMD/PowerShell), macOS/Linux (Bash/Zsh), or even code snippets.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-orange-100 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Code className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Interactive Editor</h3>
                      <p className="text-gray-600">Fine-tune the detected structure with our intuitive drag-and-drop editor before generating commands.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Code className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">History and Undo</h3>
                      <p className="text-gray-600">Make changes with confidence knowing you can easily undo and redo your edits.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Try It Section */}
          <TabsContent value="try" className="mt-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle>Try Structure from Sight</CardTitle>
                  <CardDescription>
                    Upload an image, edit the detected structure, and generate commands to recreate it.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="upload">1. Upload Image</TabsTrigger>
                      <TabsTrigger 
                        value="view" 
                        disabled={!folderStructure}
                      >
                        2. Edit Structure
                      </TabsTrigger>
                      <TabsTrigger 
                        value="generate" 
                        disabled={!editedStructure}
                      >
                        3. Generate Commands
                      </TabsTrigger>
                      <TabsTrigger 
                        value="saved" 
                      >
                        Saved Structures
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="mt-4">
                      <UploadImage 
                        onImageUpload={handleImageUpload} 
                        uploadedImage={uploadedImage}
                      />
                    </TabsContent>

                    <TabsContent value="view" className="mt-4">
                      <ViewStructure 
                        folderStructure={editedStructure} 
                        onStructureChange={handleStructureChange}
                      />
                    </TabsContent>

                    <TabsContent value="generate" className="mt-4">
                      <GenerateCommands folderStructure={editedStructure} />
                    </TabsContent>

                    <TabsContent value="saved" className="mt-4">
                      <MyStructures onLoadStructure={handleLoadSavedStructure} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
