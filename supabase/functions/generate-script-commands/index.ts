
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI specialized in script generation.
            Generate script commands to create the provided folder structure.
            Return ONLY the script with no explanation or markdown formatting.
            Use ${scriptType === 'bash' ? 'Bash for Linux/macOS' : scriptType === 'powershell' ? 'PowerShell for Windows' : 'Command Prompt for Windows'} syntax.`
          },
          {
            role: 'user',
            content: `Generate the commands to create this folder structure in ${scriptType} format:\n${JSON.stringify(folderStructure, null, 2)}`
          }
        ],
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI service');
    }

    const commands = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ commands }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generating script commands:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
