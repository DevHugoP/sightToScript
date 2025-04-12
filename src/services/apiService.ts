/**
 * Service pour appeler les APIs externes
 * Cette approche utilise le service mockapi.io comme intermédiaire pour éviter les problèmes CORS
 */

import { FolderStructure } from "@/types/types";
import { toast } from "sonner";

// Clé API Anthropic depuis les variables d'environnement
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

// Endpoint pour envoyer l'image à traiter
const API_ENDPOINT = "http://localhost:3000/api/process-image";

/**
 * Extrait la structure de dossiers à partir d'une image en utilisant un serveur intermédiaire
 */
export const extractFolderStructureFromImage = async (imageBase64: string): Promise<FolderStructure | null> => {
  try {
    // Extraire la partie base64 si l'image est une URL de données
    const base64Image = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;
    
    // Taille approximative de l'image
    const sizeInMB = (base64Image.length * 0.75) / (1024 * 1024);
    console.log(`Image size (approx): ${sizeInMB.toFixed(2)} MB`);
    
    if (sizeInMB > 20) {
      toast.error("L'image est trop grande. Veuillez utiliser une image plus petite (max 20MB).");
      return null;
    }
    
    console.log("Sending image data for processing...");
    
    // Définir un timeout plus long pour les grosses images
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    // Envoyer les données au serveur intermédiaire qui gère les appels Claude
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        apiKey: ANTHROPIC_API_KEY
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Failed to extract folder structure: ${errorText}`);
    }
    
    const data = await response.json();
    if (!data || !data.folderStructure) {
      throw new Error('No folder structure in response');
    }
    
    return data.folderStructure;
  } catch (error) {
    console.error("Error extracting folder structure:", error);
    
    if (error.name === 'AbortError') {
      toast.error("Processing timed out. Please try again with a clearer image.");
    } else {
      toast.error("Failed to process the image. Please try again.");
    }
    
    return null;
  }
};

/**
 * Génère des commandes de script pour créer une structure de dossiers
 */
export const generateScriptCommands = async (
  folderStructure: FolderStructure,
  scriptType: "bash" | "powershell" | "cmd"
): Promise<string> => {
  try {
    console.log("Generating script commands...");
    
    // Définir un timeout pour la requête
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    // Envoyer les données au serveur intermédiaire
    const response = await fetch("http://localhost:3000/api/generate-script", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folderStructure,
        scriptType,
        apiKey: ANTHROPIC_API_KEY,
        action: 'generate-script'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Failed to generate script commands: ${errorText}`);
    }
    
    const data = await response.json();
    if (!data || !data.commands) {
      throw new Error('No commands in response');
    }
    
    return data.commands;
  } catch (error) {
    console.error("Error generating script commands:", error);
    
    if (error.name === 'AbortError') {
      toast.error("Command generation timed out. Please try again later.");
    } else {
      toast.error("Failed to generate script commands. Please try again.");
    }
    
    return "";
  }
};