
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Folder, File, Edit2, Save, Trash2, FilePlus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FolderStructure } from "@/types/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { generateId } from "@/utils/treeUtils";

interface TreeNodeProps { 
  node: FolderStructure; 
  level?: number;
  onUpdate: (updatedNode: FolderStructure) => void;
  onDelete: () => void;
  onAddChild: (nodeType: "file" | "folder") => void;
  selected: boolean;
  onSelect: () => void;
}

const TreeNode = ({ 
  node,
  level = 0,
  onUpdate,
  onDelete,
  onAddChild,
  selected,
  onSelect
}: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [editValue, setEditValue] = useState(node.name);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.type === "folder";
  
  // Update editValue when node.name changes
  useEffect(() => {
    setEditValue(node.name);
  }, [node.name]);

  // Set local editing state based on node.isEditing
  useEffect(() => {
    if (node.isEditing) {
      setIsEditing(true);
    }
  }, [node.isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      console.log("Focusing input for node:", node.id);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditing]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Starting edit for node:", node.id);
    setIsEditing(true);
  };

  const handleSaveEdit = (e?: React.MouseEvent | React.FocusEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (editValue.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }
    
    console.log("Saving edit for node:", node.id, "new name:", editValue);
    setIsEditing(false);
    
    // Create a deep copy to avoid reference issues
    const updatedNode = { 
      ...node, 
      name: editValue,
      isEditing: false 
    };
    
    onUpdate(updatedNode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditValue(node.name);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  };

  const handleAddFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isFolder) {
      onAddChild("file");
    }
  };

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isFolder) {
      onAddChild("folder");
    }
  };

  return (
    <div className="select-none">
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            className={`flex items-center py-1 hover:bg-gray-100 rounded cursor-pointer ${selected ? 'bg-blue-100' : ''}`} 
            style={{ paddingLeft: `${level * 20}px` }}
            onClick={handleSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isFolder ? (
              <>
                <span onClick={toggleOpen}>
                  {hasChildren ? (
                    isOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
                    )
                  ) : (
                    <span className="w-4 mr-1" />
                  )}
                </span>
                <Folder className="h-4 w-4 text-yellow-500 mr-2" />
              </>
            ) : (
              <>
                <span className="w-4 mr-1" />
                <File className="h-4 w-4 text-blue-500 mr-2" />
              </>
            )}
            
            {isEditing ? (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center flex-grow"
              >
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-6 p-1 text-sm w-40"
                  onBlur={(e) => {
                    // Small delay to prevent instant closing when clicking save button
                    setTimeout(() => handleSaveEdit(e), 100);
                  }}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => handleSaveEdit(e)} 
                  className="h-6 w-6 ml-1"
                >
                  <Save className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="flex-grow">{node.name}</span>
                {(selected || isHovered) && (
                  <div className="flex items-center space-x-1 ml-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleStartEdit} 
                      className="h-6 w-6 text-gray-500 hover:text-blue-500"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleDelete} 
                      className="h-6 w-6 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    {isFolder && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleAddFile} 
                          className="h-6 w-6 text-gray-500 hover:text-blue-500"
                        >
                          <FilePlus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleAddFolder} 
                          className="h-6 w-6 text-gray-500 hover:text-yellow-500"
                        >
                          <FolderPlus className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isFolder && (
            <>
              <ContextMenuItem onClick={handleAddFolder}>
                Add Folder
              </ContextMenuItem>
              <ContextMenuItem onClick={handleAddFile}>
                Add File
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={handleStartEdit}>Rename</ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      {isOpen && hasChildren && (
        <div>
          {node.children?.map((child, index) => (
            <TreeNode 
              key={child.id || `${child.name}-${index}`} 
              node={child} 
              level={level + 1}
              onUpdate={(updatedChild) => {
                const newChildren = [...(node.children || [])];
                newChildren[index] = updatedChild;
                onUpdate({ ...node, children: newChildren });
              }}
              onDelete={() => {
                const newChildren = [...(node.children || [])];
                newChildren.splice(index, 1);
                onUpdate({ ...node, children: newChildren });
              }}
              onAddChild={(type) => {
                const newChild: FolderStructure = {
                  name: type === "folder" ? "New folder" : "new_file.txt",
                  type,
                  id: generateId(),
                  isEditing: true,
                  children: type === "folder" ? [] : undefined
                };
                const newChildren = [...(child.children || []), newChild];
                const updatedChild = { ...child, children: newChildren };
                const parentChildren = [...(node.children || [])];
                parentChildren[index] = updatedChild;
                onUpdate({ ...node, children: parentChildren });
              }}
              selected={false}
              onSelect={() => onSelect()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
