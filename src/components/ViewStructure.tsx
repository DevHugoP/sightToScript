
import { useState, useEffect, useCallback } from "react";
import { Plus, Folder, File, Undo, Redo, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FolderStructure } from "@/types/types";
import TreeNode from "@/components/TreeNode";
import { 
  addIdsToStructure, 
  generateId, 
  updateNodeById, 
  findNodeById, 
  deepClone 
} from "@/utils/treeUtils";
import SaveStructureDialog from "@/components/SaveStructureDialog";
import { useAuth } from "@/contexts/AuthContext";

interface ViewStructureProps {
  folderStructure: FolderStructure | null;
  onStructureChange?: (newStructure: FolderStructure) => void;
}

interface HistoryState {
  past: FolderStructure[];
  present: FolderStructure | null;
  future: FolderStructure[];
}

const MAX_HISTORY = 20; // Increased history limit for better undo/redo experience

const ViewStructure = ({ folderStructure, onStructureChange }: ViewStructureProps) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: null,
    future: []
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize history with folderStructure
  useEffect(() => {
    if (folderStructure && !history.present) {
      // Add IDs to the structure if not already done
      const structureWithIds = addIdsToStructure(folderStructure);
      console.log("Structure with IDs:", structureWithIds);
      setHistory({
        past: [],
        present: structureWithIds,
        future: []
      });
    }
  }, [folderStructure]);

  const handleStructureUpdate = useCallback((updatedStructure: FolderStructure) => {
    console.log("Structure updated:", updatedStructure);
    
    setHistory(prevHistory => {
      // Limit past history to MAX_HISTORY items
      const newPast = prevHistory.present 
        ? [...prevHistory.past.slice(-MAX_HISTORY + 1), prevHistory.present]
        : prevHistory.past;
      
      return {
        past: newPast,
        present: updatedStructure,
        future: []  // Clear future on new change
      };
    });
    
    if (onStructureChange) {
      onStructureChange(updatedStructure);
    }
  }, [onStructureChange]);

  // Simplified undo action
  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) {
        toast.info("Nothing to undo");
        return prev;
      }

      const newPast = [...prev.past];
      const previousState = newPast.pop();
      
      return {
        past: newPast,
        present: previousState as FolderStructure,
        future: prev.present ? [prev.present, ...prev.future] : prev.future
      };
    });
    
    toast.success("Action undone");
  }, []);

  // Simplified redo action
  const handleRedo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) {
        toast.info("Nothing to redo");
        return prev;
      }

      const [nextState, ...newFuture] = prev.future;
      
      return {
        past: prev.present ? [...prev.past, prev.present] : prev.past,
        present: nextState,
        future: newFuture
      };
    });
    
    toast.success("Action redone");
  }, []);

  // Set up keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          // Ctrl+Shift+Z or Cmd+Shift+Z for Redo
          handleRedo();
        } else {
          // Ctrl+Z or Cmd+Z for Undo
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        // Ctrl+Y or Cmd+Y for Redo
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const renderTree = (node: FolderStructure): JSX.Element => {
    return (
      <TreeNode 
        key={node.id} 
        node={node} 
        onUpdate={(updatedNode) => {
          console.log("Node update received in ViewStructure:", updatedNode);
          if (history.present) {
            // Deep clone to avoid reference issues
            const updatedStructure = deepClone(history.present);
            const updated = updateNodeById(updatedStructure, updatedNode.id || '', updatedNode);
            handleStructureUpdate(updated);
          }
        }}
        onDelete={() => {
          // Do not allow deleting the root node
          toast.error("Cannot delete the root node");
        }}
        onAddChild={(type) => {
          const newChild: FolderStructure = {
            name: type === "folder" ? "New folder" : "new_file.txt",
            type,
            id: generateId(),
            isEditing: true,
            children: type === "folder" ? [] : undefined
          };
          const updatedStructure = { 
            ...history.present as FolderStructure, 
            children: [...((history.present as FolderStructure).children || []), newChild] 
          };
          handleStructureUpdate(updatedStructure);
        }}
        selected={node.id === selectedNodeId}
        onSelect={() => handleNodeSelect(node.id || '')}
      />
    );
  };

  if (!history.present) {
    return <div>No structure to display</div>;
  }

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <Card className="bg-white shadow-md transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <span>Detected Folder Structure</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`transition-all ${!canUndo ? 'opacity-50' : 'hover:bg-gray-100'}`}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
              className={`transition-all ${!canRedo ? 'opacity-50' : 'hover:bg-gray-100'}`}
            >
              <Redo className="h-4 w-4" />
            </Button>
            {history.present && <SaveStructureDialog folderStructure={history.present} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[500px]">
          {renderTree(history.present)}
        </div>
        
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="secondary"
              onClick={() => {
                const newFolder: FolderStructure = {
                  name: "New folder",
                  type: "folder",
                  id: generateId(),
                  isEditing: true,
                  children: []
                };
                const updatedStructure = { 
                  ...history.present, 
                  children: [...(history.present.children || []), newFolder] 
                };
                handleStructureUpdate(updatedStructure);
              }}
              className="flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              <Folder className="h-4 w-4 mr-2" />
              Add Folder
            </Button>
            <Button 
              variant="secondary"
              onClick={() => {
                const newFile: FolderStructure = {
                  name: "new_file.txt",
                  type: "file",
                  id: generateId(),
                  isEditing: true
                };
                const updatedStructure = { 
                  ...history.present, 
                  children: [...(history.present.children || []), newFile] 
                };
                handleStructureUpdate(updatedStructure);
              }}
              className="flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              <File className="h-4 w-4 mr-2" />
              Add File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewStructure;
