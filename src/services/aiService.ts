
import { FolderStructure } from "@/types/types";
import { toast } from "sonner";
import { anthropicProxy } from "./corsProxy";

// Anthropic API configuration - récupération depuis les variables d'environnement
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
const callAnthropicAPI = anthropicProxy(ANTHROPIC_API_KEY);

// Supabase configuration (kept for compatibility)
const SUPABASE_FUNCTION_URL = "https://ebsmnftlbmrjtvmhflti.supabase.co/functions/v1";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVic21uZnRsYm1yanR2bWhmbHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjU2MjUsImV4cCI6MjA1OTk0MTYyNX0.W9t24BpstgITrxKk-ZahZBjm3pnf8KTJXt-jfCQ_VwY";

/**
 * Extract folder structure from an image using Claude AI directly
 */
export const extractFolderStructureFromImage = async (imageBase64: string): Promise<FolderStructure | null> => {
  try {
    // Extract the base64 part if the image is a data URL
    const base64Image = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;
    
    console.log("Making request to Anthropic API via CORS proxy");
    
    // Setup request payload for Claude Vision
    const payload = {
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      system: `You are an AI specialized in image analysis and folder structure extraction. 
              Analyze the provided image and extract the folder structure visible in it.
              Return ONLY a JSON object representing the folder structure with the following format:
              {
                "name": "root",
                "type": "folder",
                "children": [
                  {
                    "name": "folderName",
                    "type": "folder",
                    "children": [...]
                  },
                  {
                    "name": "fileName.ext",
                    "type": "file"
                  }
                ]
              }`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the folder structure from this image. Return only the JSON object.'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ]
    };
    
    // Make the API call through our CORS proxy
    const data = await callAnthropicAPI(payload);
    
    if (!data.content || data.content.length === 0) {
      throw new Error('No response from Claude AI service');
    }
    
    // Extract the JSON content from the response
    const aiResponse = data.content[0].text.trim();
    let folderStructure;
    
    try {
      // Find and extract JSON from the text response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        folderStructure = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to extract JSON from AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse folder structure from AI response');
    }
    
    // Add unique IDs to the structure for editing functionality
    const addIdsToStructure = (node: any, parentId = '') => {
      const nodeId = crypto.randomUUID();
      node.id = nodeId;
      
      if (node.children && node.children.length > 0) {
        node.children = node.children.map((child: any) => addIdsToStructure(child, nodeId));
      }
      
      return node;
    };

    const structureWithIds = addIdsToStructure(folderStructure);
    
    return structureWithIds;
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
 * Generate script commands to create a folder structure
 */
export const generateScriptCommands = async (
  folderStructure: FolderStructure,
  scriptType: "bash" | "powershell" | "cmd"
): Promise<string> => {
  try {
    console.log("Making request to Anthropic API via CORS proxy for script generation");
    
    // Setup request payload for script generation
    const payload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: `You are an AI specialized in script generation.
              Generate script commands to create the provided folder structure.
              Return ONLY the script with no explanation or markdown formatting.
              Use ${scriptType === 'bash' ? 'Bash for Linux/macOS' : scriptType === 'powershell' ? 'PowerShell for Windows' : 'Command Prompt for Windows'} syntax.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate the commands to create this folder structure in ${scriptType} format:\n${JSON.stringify(folderStructure, null, 2)}`
            }
          ]
        }
      ]
    };
    
    // Make the API call through our CORS proxy
    const data = await callAnthropicAPI(payload);
    
    if (!data.content || data.content.length === 0) {
      throw new Error('No response from Claude AI service');
    }
    
    const commands = data.content[0].text.trim();
    
    return commands;
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
