/**
 * Simple CORS proxy for API requests
 * 
 * Cette fonction enveloppe les appels à l'API Anthropic pour éviter les erreurs CORS
 * dans le navigateur. Elle utilise un service proxy public pour contourner ces restrictions.
 */

// URL du service proxy CORS
const CORS_PROXY = "https://corsproxy.io/?";

/**
 * Crée une fonction qui appelle une API via un proxy CORS
 */
export const createCorsProxy = (apiUrl: string, headers: Record<string, string>) => {
  return async (body: any) => {
    try {
      console.log("Making CORS proxy request to:", apiUrl);
      
      // Vérifier la taille des données d'image pour éviter des erreurs
      if (body.messages && body.messages[0].content) {
        const content = body.messages[0].content;
        for (const item of content) {
          if (item.type === 'image' && item.source && item.source.data) {
            const sizeInMB = (item.source.data.length * 0.75) / (1024 * 1024); // Estimation rapide en MB
            console.log(`Image size (approx): ${sizeInMB.toFixed(2)} MB`);
            
            if (sizeInMB > 20) {
              console.warn("Image trop grande! Claude accepte max 20MB");
              throw new Error("L'image est trop grande. Veuillez utiliser une image plus petite (max 20MB).");
            }
          }
        }
      }
      
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;
      console.log("Using proxy URL:", proxyUrl);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(body)
      });

      console.log("CORS proxy response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const jsonResponse = await response.json();
      console.log("CORS proxy response received successfully");
      return jsonResponse;
    } catch (error) {
      console.error("CORS proxy request failed:", error);
      throw error;
    }
  };
};

// Exportons un proxy spécifique pour l'API Anthropic
export const anthropicProxy = (apiKey: string) => {
  return createCorsProxy("https://api.anthropic.com/v1/messages", {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  });
};