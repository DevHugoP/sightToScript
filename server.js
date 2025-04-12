/**
 * Serveur proxy simple pour Anthropic API
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = "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";

// CORS middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Endpoint pour le traitement d'images
app.post('/api/process-image', async (req, res) => {
  try {
    console.log('Processing image request');
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Extraire la partie base64 si l'image est une URL de données
    const base64Image = image.includes('base64,') 
      ? image.split('base64,')[1] 
      : image;
    
    // Taille approximative de l'image
    const sizeInMB = (base64Image.length * 0.75) / (1024 * 1024);
    console.log(`Image size (approx): ${sizeInMB.toFixed(2)} MB`);
    
    if (sizeInMB > 20) {
      return res.status(400).json({ error: 'Image is too large. Please use a smaller image (max 20MB).' });
    }
    
    console.log('Forwarding request to Anthropic API');
    
    // Appeler l'API Anthropic pour analyser l'image
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API Error:', response.status, errorText);
      return res.status(response.status).json({ error: `API Error: ${errorText}` });
    }
    
    const data = await response.json();
    
    if (!data.content || data.content.length === 0) {
      return res.status(500).json({ error: 'No response from Claude AI' });
    }
    
    // Extraire le JSON du texte de réponse
    const aiResponse = data.content[0].text.trim();
    let folderStructure;
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        folderStructure = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to extract JSON from AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse folder structure' });
    }
    
    // Ajouter des IDs à la structure de dossiers
    const addIdsToStructure = (node, parentId = '') => {
      const nodeId = randomUUID();
      node.id = nodeId;
      
      if (node.children && node.children.length > 0) {
        node.children = node.children.map(child => addIdsToStructure(child, nodeId));
      }
      
      return node;
    };
    
    const structureWithIds = addIdsToStructure(folderStructure);
    
    return res.json({ folderStructure: structureWithIds });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint pour la génération de scripts
app.post('/api/generate-script', async (req, res) => {
  try {
    console.log('Processing script generation request');
    const { folderStructure, scriptType } = req.body;
    
    if (!folderStructure) {
      return res.status(400).json({ error: 'No folder structure provided' });
    }
    
    if (!scriptType) {
      return res.status(400).json({ error: 'No script type provided' });
    }
    
    console.log('Forwarding request to Anthropic API');
    
    // Appeler l'API Anthropic pour générer le script
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API Error:', response.status, errorText);
      return res.status(response.status).json({ error: `API Error: ${errorText}` });
    }
    
    const data = await response.json();
    
    if (!data.content || data.content.length === 0) {
      return res.status(500).json({ error: 'No response from Claude AI' });
    }
    
    const commands = data.content[0].text.trim();
    
    return res.json({ commands });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
createServer(app).listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});