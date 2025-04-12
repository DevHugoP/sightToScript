
import { supabase } from "@/integrations/supabase/client";
import { FolderStructure } from "@/types/types";

export const saveFolderStructure = async (name: string, structure: FolderStructure) => {
  const { data, error } = await supabase
    .from('folder_structures')
    .insert({
      name,
      structure: structure as any, // Cast to any to resolve the JSON type issue
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserFolderStructures = async () => {
  const { data, error } = await supabase
    .from('folder_structures')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const getFolderStructure = async (id: string) => {
  const { data, error } = await supabase
    .from('folder_structures')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateFolderStructure = async (id: string, updates: {
  name?: string;
  structure?: FolderStructure;
}) => {
  const { data, error } = await supabase
    .from('folder_structures')
    .update({
      ...updates,
      structure: updates.structure as any, // Cast to any to resolve the JSON type issue
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteFolderStructure = async (id: string) => {
  const { error } = await supabase
    .from('folder_structures')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
};
