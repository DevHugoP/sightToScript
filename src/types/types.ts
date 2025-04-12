
export interface FolderStructure {
  name: string;
  type: "file" | "folder";
  children?: FolderStructure[];
  id?: string; // ID unique pour faciliter l'édition
  isEditing?: boolean; // Indicateur pour savoir si l'élément est en cours d'édition
}

export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

export interface SavedFolderStructure {
  id: string;
  user_id: string;
  name: string;
  structure: FolderStructure;
  created_at: string;
  updated_at: string;
}
