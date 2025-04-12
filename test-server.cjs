/**
 * Script simple pour tester le serveur backend
 */

const http = require('http');

// URL du serveur backend
const serverUrl = 'http://localhost:3000/';

// Fonction pour envoyer une requête HTTP GET
function testServer() {
  http.get(serverUrl, (res) => {
    let data = '';
    
    // A chunk of data has been received.
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    // The whole response has been received
    res.on('end', () => {
      console.log('✅ Serveur actif!');
      console.log('Réponse:', data);
      console.log('\nVotre serveur backend est en cours d\'exécution et répond aux requêtes.');
      console.log('Vous pouvez maintenant utiliser l\'application front-end sur http://localhost:8081');
    });
  }).on('error', (error) => {
    console.error('❌ Erreur de connexion au serveur:', error.message);
    console.log('\nAssurez-vous que le serveur backend est en cours d\'exécution avec:');
    console.log('npm run server');
    
    console.log('\nVérifiez que vous avez lancé le serveur backend avec:');
    console.log('node server.cjs');
  });
}

console.log('Test de connexion au serveur backend...');
testServer();