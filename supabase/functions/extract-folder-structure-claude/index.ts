
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract the base64 part if the image is a data URL
    const base64Image = image.includes('base64,') 
      ? image.split('base64,')[1] 
      : image;

    console.log("Making request to Anthropic API with image data");
    
    // Check if API key is available
    if (!anthropicApiKey) {
      console.error("Missing Anthropic API key");
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Make a request to the Anthropic API with Claude Vision capabilities
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
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
      }),
    });
    
    console.log("Received response from Anthropic API:", response.status);
    
    if (!response.ok) {
      throw new Error(`Anthropic API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
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
    
    if (!folderStructure) {
      throw new Error('No folder structure in AI response');
    }

    // Add unique IDs to the structure for editing functionality
    const addIdsToStructure = (node, parentId = '') => {
      const nodeId = crypto.randomUUID();
      node.id = nodeId;
      
      if (node.children && node.children.length > 0) {
        node.children = node.children.map(child => addIdsToStructure(child, nodeId));
      }
      
      return node;
    };

    const structureWithIds = addIdsToStructure(data.folderStructure);
    console.log("Added IDs to folder structure");

    return new Response(
      JSON.stringify({ folderStructure: structureWithIds }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extracting folder structure:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
