// Charge les variables d'environnement depuis le fichier .env
const fs = require('fs');
const path = require('path');

// Charger les variables depuis .env
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    
    if (fs.existsSync(envPath)) {
      console.log('Chargement des variables d\'environnement depuis .env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Analyser chaque ligne
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, value] = trimmedLine.split('=');
          if (key && value) {
            process.env[key.trim()] = value.trim();
          }
        }
      });
    } else {
      console.warn('Fichier .env non trouvé.');
    }
  } catch (error) {
    console.error('Erreur lors du chargement des variables d\'environnement:', error);
  }
}

// Charger les variables d'environnement
loadEnv();

// Exporter les variables configurées
module.exports = {
  port: process.env.SERVER_PORT || 3000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
};