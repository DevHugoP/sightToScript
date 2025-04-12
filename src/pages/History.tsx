
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserFolderStructures } from "@/services/folderStructureService";
import MyStructures from "@/components/MyStructures";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // If user is not authenticated, redirect to auth page
    if (!user && !isLoading) {
      toast.error("Please sign in to view your history");
      navigate("/auth");
    }
  }, [user, navigate, isLoading]);
  
  const handleLoadStructure = (structure: any) => {
    // Store the structure in sessionStorage to access it from the main page
    sessionStorage.setItem("loadedStructure", JSON.stringify(structure));
    navigate("/"); // Redirect to home page
    toast.success("Structure loaded successfully. Redirecting to editor...");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Your Saved Structures</h1>
          </div>
          
          <MyStructures onLoadStructure={handleLoadStructure} />
        </div>
      </main>
    </div>
  );
};

export default History;
