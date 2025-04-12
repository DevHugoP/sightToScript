
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { saveFolderStructure } from "@/services/folderStructureService";
import { toast } from "sonner";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderStructure } from "@/types/types";

interface SaveStructureDialogProps {
  folderStructure: FolderStructure;
}

const SaveStructureDialog = ({ folderStructure }: SaveStructureDialogProps) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your structure");
      return;
    }

    if (!user) {
      toast.error("You must be signed in to save structures");
      return;
    }

    try {
      setIsLoading(true);
      await saveFolderStructure(name, folderStructure);
      toast.success("Structure saved successfully!");
      setIsOpen(false);
      setName("");
    } catch (error: any) {
      console.error("Error saving structure:", error);
      toast.error(error.message || "Failed to save structure");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Button 
        variant="outline" 
        className="flex items-center" 
        onClick={() => toast.error("You must be signed in to save structures")}
      >
        <Save className="mr-2 h-4 w-4" />
        Save Structure
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <Save className="mr-2 h-4 w-4" />
          Save Structure
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Folder Structure</DialogTitle>
          <DialogDescription>
            Give your folder structure a name to save it to your account
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Structure Name</Label>
            <Input
              id="name"
              placeholder="My Project Structure"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>Save</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveStructureDialog;
