# Sight to Script

## Présentation

![Capture d’écran 2025-04-12 à 10 54 42](https://github.com/user-attachments/assets/dcbe68ab-0817-4554-8d15-b14d6dc9efaa)


Sight to Script est une application web innovante qui transforme les images de structures de dossiers en scripts exécutables. Imaginez que vous voyez une structure de répertoires dans un tutoriel, une documentation ou une présentation : il vous suffit de prendre une capture d'écran, de la télécharger dans notre application, et vous obtenez instantanément les commandes nécessaires pour recréer cette structure sur votre système.

L'application utilise l'IA Claude d'Anthropic pour analyser les images et extraire la hiérarchie des dossiers et fichiers. Elle permet ensuite de générer des scripts dans différents formats pour s'adapter à n'importe quel système d'exploitation.

## Fonctionnalités principales

- **Extraction intelligente** : Analyse des images de structures de dossiers grâce à l'IA Claude
- **Édition interactive** : Modification de la structure détectée avant la génération de scripts
- **Multi-plateformes** : Génération de scripts dans plusieurs formats :
  - Bash (Linux/macOS)
  - PowerShell (Windows)
  - CMD (Windows Command Prompt)
- **Conversion d'images** : Traitement automatique de divers formats d'images
- **Gestion des erreurs** : Analyse robuste avec feedback utilisateur en cas de problèmes

## Architecture technique

L'application s'articule autour de deux composants principaux :

1. **Frontend** : Application React avec TypeScript et Tailwind CSS qui gère l'interface utilisateur
2. **Serveur Backend** : Serveur Node.js qui fait le lien avec l'API Claude d'Anthropic

### Flux de traitement

1. L'utilisateur télécharge une image via l'interface
2. L'image est envoyée au serveur backend
3. Le backend convertit l'image en JPEG (pour compatibilité avec Claude)
4. L'API Claude analyse l'image et extrait la structure de dossiers
5. La structure est renvoyée au frontend pour affichage et édition
6. L'utilisateur peut modifier la structure si nécessaire
7. La génération de scripts est effectuée localement pour plus d'efficacité

## Guide de démarrage

### Prérequis

- Node.js (v16 ou supérieur)
- Un compte Anthropic et une clé API Claude

### Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/DevHugoP/sight-to-script.git
   cd sight-to-script
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configuration de l'environnement :
   ```bash
   cp .env.example .env
   ```
   
4. Éditez le fichier `.env` et ajoutez votre clé API Anthropic :
   ```
   VITE_ANTHROPIC_API_KEY=votre_clé_api_anthropic
   ANTHROPIC_API_KEY=votre_même_clé_api_anthropic
   SERVER_PORT=3000
   ```

### Lancement

L'application nécessite deux processus simultanés : le serveur backend et l'application frontend.

#### Étape 1 : Démarrer le serveur backend

```bash
# Dans un premier terminal
node server.cjs
```

Vous devriez voir :
```
Server running on http://localhost:3000
```

#### Étape 2 : Démarrer l'application frontend

```bash
# Dans un second terminal
npm run dev
```

Vous verrez quelque chose comme :
```
VITE v5.4.10  ready in 111 ms

➜  Local:   http://localhost:8081/
➜  Network: http://172.20.10.5:8081/
```

#### Étape 3 : Accéder à l'application

Ouvrez votre navigateur et accédez à l'URL indiquée (généralement http://localhost:8081).

## Guide d'utilisation

1. Sur la page d'accueil, cliquez sur "Try it now"
2. Téléchargez une image de structure de dossiers (capture d'écran, diagramme, etc.)
3. L'application analysera l'image et affichera la structure détectée
4. Vous pouvez éditer la structure si nécessaire
5. Sélectionnez le type de script souhaité (Bash, PowerShell ou CMD)
6. Copiez les commandes générées pour les exécuter sur votre système

## Dépannage

### Le serveur ne démarre pas
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Assurez-vous que Node.js est correctement installé

### Erreur d'analyse d'image
- Vérifiez que l'image est claire et lisible
- Essayez avec une image de meilleure qualité
- Assurez-vous que votre clé API est correctement configurée

### Problèmes de génération de scripts
- Vérifiez que la structure détectée est correcte avant de générer les scripts
- En cas d'erreur, essayez de simplifier la structure

## Développement futur

- Support pour les modèles d'IA locaux (hors-ligne)
- Fonctionnalités de partage et d'exportation
- Intégration avec des outils de développement
- Options de personnalisation des scripts générés

## Technologies utilisées

- **Frontend** : React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend** : Node.js, Express
- **IA** : Anthropic Claude API
- **Traitement d'image** : Sharp
- **Outils de développement** : ESLint, Git

## Licence

Ce projet est sous licence MIT.
