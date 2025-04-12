/**
 * Serveur proxy simple pour Anthropic API
 * Avec conversion d'image automatique vers JPEG
 */

// Charger les variables d'environnement
const config = require('./config.cjs');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const crypto = require('crypto');
const sharp = require('sharp');

const app = express();
const PORT = config.port;
const ANTHROPIC_API_KEY = config.anthropicApiKey;

// Vérifier que la clé API est définie
if (!ANTHROPIC_API_KEY) {
  console.error("⚠️ ATTENTION: La clé API Anthropic n'est pas définie. Définissez ANTHROPIC_API_KEY dans le fichier .env");
}

// CORS middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

/**
 * Convertit une image base64 en JPEG base64
 * @param {string} base64Image - Image en base64
 * @param {string} originalType - Type MIME original
 * @returns {Promise<string>} - Image JPEG en base64
 */
async function convertToJpeg(base64Image, originalType) {
  try {
    console.log(`Converting image from ${originalType} to JPEG...`);
    
    // Decoder le base64 en buffer
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Convertir l'image en JPEG
    const jpegBuffer = await sharp(buffer)
      .jpeg({ quality: 90 }) // Qualité JPEG
      .toBuffer();
    
    // Retourner l'image en base64
    return jpegBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting image to JPEG:', error);
    throw new Error('Failed to convert image to JPEG');
  }
}

// Endpoint pour le traitement d'images
app.post('/api/process-image', async (req, res) => {
  try {
    console.log('Processing image request');
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Extraire la partie base64 et le type d'image
    let base64Image = image;
    let originalMediaType = 'image/jpeg'; // Type par défaut
    
    if (image.includes('base64,')) {
      // Format typique: "data:image/png;base64,iVBORw0KGgo..."
      const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        originalMediaType = matches[1];
        base64Image = matches[2];
      } else {
        base64Image = image.split('base64,')[1];
      }
    }
    
    // Taille approximative de l'image
    const sizeInMB = (base64Image.length * 0.75) / (1024 * 1024);
    console.log(`Image size (approx): ${sizeInMB.toFixed(2)} MB`);
    
    if (sizeInMB > 20) {
      return res.status(400).json({ error: 'Image is too large. Please use a smaller image (max 20MB).' });
    }
    
    console.log(`Original image format: ${originalMediaType}`);
    
    // Convertir l'image en JPEG quelle que soit son format d'origine
    const jpegBase64 = await convertToJpeg(base64Image, originalMediaType);
    console.log('Image successfully converted to JPEG');
    
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
                  data: jpegBase64
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
      const nodeId = crypto.randomUUID();
      node.id = nodeId;
      
      if (node.children && node.children.length > 0) {
        node.children = node.children.map(child => addIdsToStructure(child, nodeId));
      }
      
      return node;
    };
    
    const structureWithIds = addIdsToStructure(folderStructure);
    console.log('Successfully extracted folder structure from image');
    
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
    console.log('Script commands generated successfully');
    
    return res.json({ commands });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Route simple pour tester que le serveur est en marche
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});