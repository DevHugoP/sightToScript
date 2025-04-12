
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserFolderStructures, deleteFolderStructure } from "@/services/folderStructureService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Trash2, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StoredStructure {
  id: string;
  name: string;
  structure: any;
  created_at: string;
  updated_at: string;
}

interface MyStructuresProps {
  onLoadStructure: (structure: any) => void;
}

const MyStructures = ({ onLoadStructure }: MyStructuresProps) => {
  const { user } = useAuth();
  const [structures, setStructures] = useState<StoredStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStructure, setSelectedStructure] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadStructures();
    }
  }, [user]);

  const loadStructures = async () => {
    try {
      setIsLoading(true);
      const data = await getUserFolderStructures();
      setStructures(data);
    } catch (error) {
      console.error("Error loading structures:", error);
      toast.error("Failed to load your saved structures");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFolderStructure(id);
      setStructures(structures.filter(s => s.id !== id));
      toast.success("Structure deleted successfully");
    } catch (error) {
      console.error("Error deleting structure:", error);
      toast.error("Failed to delete structure");
    }
  };

  const handleLoad = (structure: any) => {
    onLoadStructure(structure);
    toast.success("Structure loaded successfully");
  };

  const renderFolderStructure = (node: any, level = 0) => {
    const indent = level * 20;
    
    if (!node) return null;
    
    if (node.type === "file") {
      return (
        <div 
          key={node.id || `file-${node.name}-${level}`}
          className="flex items-center py-1"
          style={{ paddingLeft: `${indent}px` }}
        >
          <div className="flex items-center">
            <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{node.name}</span>
          </div>
        </div>
      );
    }
    
    return (
      <div key={node.id || `folder-${node.name}-${level}`}>
        <div 
          className="flex items-center py-1"
          style={{ paddingLeft: `${indent}px` }}
        >
          <div className="flex items-center">
            <svg className="h-4 w-4 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>{node.name}</span>
          </div>
        </div>
        {node.children && node.children.map((child: any) => renderFolderStructure(child, level + 1))}
      </div>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>Please sign in to view your saved structures.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Folder className="mr-2 h-5 w-5" />
          My Saved Structures
        </CardTitle>
        <CardDescription>
          Access your previously saved folder structures
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : structures.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <Folder className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium mb-2">No saved structures</h3>
            <p className="text-gray-500 mb-4">
              Structures you save will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {structures.map((structure) => (
              <Card key={structure.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium truncate mr-2">{structure.name}</h3>
                    <div className="flex">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Structure">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{structure.name}</DialogTitle>
                            <DialogDescription>
                              Created on {format(new Date(structure.created_at), "PPP")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="overflow-hidden border rounded-md bg-gray-50">
                            <div className="overflow-auto p-4" style={{ maxHeight: "400px" }}>
                              {renderFolderStructure(structure.structure)}
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button onClick={() => handleLoad(structure.structure)}>
                              Load Structure
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the structure "{structure.name}".
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(structure.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(structure.updated_at), "PP")}
                  </div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2" 
                    onClick={() => handleLoad(structure.structure)}
                  >
                    Load Structure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyStructures;
