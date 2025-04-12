/**
 * Script simple pour tester le serveur backend
 */

import fetch from 'node-fetch';

// URL du serveur backend
const serverUrl = 'http://localhost:3000/';

// Fonction pour tester le serveur
async function testServer() {
  try {
    const response = await fetch(serverUrl);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Serveur actif!');
      console.log('Réponse:', data);
      console.log('\nVotre serveur backend est en cours d\'exécution et répond aux requêtes.');
      console.log('Vous pouvez maintenant utiliser l\'application front-end sur http://localhost:8081');
    } else {
      console.error('❌ Le serveur a répondu avec un code d\'erreur:', response.status);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion au serveur:', error.message);
    console.log('\nAssurez-vous que le serveur backend est en cours d\'exécution avec:');
    console.log('npm run server');
  }
}

console.log('Test de connexion au serveur backend...');
testServer();