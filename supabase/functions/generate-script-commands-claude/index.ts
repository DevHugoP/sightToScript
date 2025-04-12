
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
    const { folderStructure, scriptType } = await req.json();
    
    if (!folderStructure) {
      return new Response(
        JSON.stringify({ error: 'No folder structure provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate scriptType
    const validScriptTypes = ['bash', 'powershell', 'cmd'];
    if (!validScriptTypes.includes(scriptType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid script type. Must be one of: bash, powershell, cmd' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log("Making request to Anthropic API for script generation");
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
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
      }),
    });
    
    console.log("Received response from Anthropic API:", response.status);
    
    const data = await response.json();
    
    if (!data.content || data.content.length === 0) {
      throw new Error('No response from Claude AI service');
    }

    const commands = data.content[0].text.trim();
    console.log("Successfully generated script commands");

    return new Response(
      JSON.stringify({ commands }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generating script commands with Claude:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
