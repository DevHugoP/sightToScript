
import { FolderStructure } from "@/types/types";
import { v4 as uuidv4 } from 'uuid';

// Generate a unique ID using UUID v4
export const generateId = (): string => {
  return uuidv4();
};

// Add IDs to the structure recursively
export const addIdsToStructure = (node: FolderStructure): FolderStructure => {
  const nodeWithId = { 
    ...node, 
    id: node.id || generateId(),
    isEditing: false
  };
  
  if (nodeWithId.children && nodeWithId.children.length > 0) {
    nodeWithId.children = nodeWithId.children.map(child => addIdsToStructure(child));
  }
  
  return nodeWithId;
};

// Find a node by ID recursively
export const findNodeById = (node: FolderStructure, id: string): FolderStructure | null => {
  if (node.id === id) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  
  return null;
};

// Update a node by ID recursively
export const updateNodeById = (node: FolderStructure, id: string, updates: Partial<FolderStructure>): FolderStructure => {
  console.log(`updateNodeById: Checking node ${node.name} (${node.id}) against target ${id}`);
  
  if (node.id === id) {
    console.log(`updateNodeById: Found node ${node.name}, applying updates:`, updates);
    return { ...node, ...updates };
  }
  
  if (node.children) {
    console.log(`updateNodeById: Checking children of ${node.name}`);
    return {
      ...node,
      children: node.children.map(child => updateNodeById(child, id, updates))
    };
  }
  
  return node;
};

// Deep clone an object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
