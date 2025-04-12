/**
 * Utilitaire pour générer des scripts de création de structure de dossiers
 */

import { FolderStructure } from "@/types/types";

/**
 * Génère des commandes Bash pour créer une structure de dossiers
 */
export function generateBashCommands(structure: FolderStructure): string {
  const commands: string[] = [];
  commands.push("#!/bin/bash");
  commands.push("");
  commands.push("# Script généré automatiquement pour créer la structure de dossiers");
  commands.push("");
  
  // Fonction récursive pour générer les commandes
  function processNode(node: FolderStructure, path: string = ""): void {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    
    if (node.type === "folder") {
      commands.push(`mkdir -p "${currentPath}"`);
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          processNode(child, currentPath);
        });
      }
    } else if (node.type === "file") {
      commands.push(`touch "${currentPath}"`);
    }
  }
  
  processNode(structure);
  return commands.join("\n");
}

/**
 * Génère des commandes PowerShell pour créer une structure de dossiers
 */
export function generatePowerShellCommands(structure: FolderStructure): string {
  const commands: string[] = [];
  commands.push("# Script PowerShell généré automatiquement pour créer la structure de dossiers");
  commands.push("");
  
  // Fonction récursive pour générer les commandes
  function processNode(node: FolderStructure, path: string = ""): void {
    const currentPath = path ? `${path}\\${node.name}` : node.name;
    
    if (node.type === "folder") {
      commands.push(`New-Item -ItemType Directory -Force -Path "${currentPath}"`);
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          processNode(child, currentPath);
        });
      }
    } else if (node.type === "file") {
      commands.push(`New-Item -ItemType File -Force -Path "${currentPath}"`);
    }
  }
  
  processNode(structure);
  return commands.join("\n");
}

/**
 * Génère des commandes CMD (Windows) pour créer une structure de dossiers
 */
export function generateCmdCommands(structure: FolderStructure): string {
  const commands: string[] = [];
  commands.push("@echo off");
  commands.push("REM Script CMD généré automatiquement pour créer la structure de dossiers");
  commands.push("");
  
  // Fonction récursive pour générer les commandes
  function processNode(node: FolderStructure, path: string = ""): void {
    const currentPath = path ? `${path}\\${node.name}` : node.name;
    
    if (node.type === "folder") {
      commands.push(`if not exist "${currentPath}" mkdir "${currentPath}"`);
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          processNode(child, currentPath);
        });
      }
    } else if (node.type === "file") {
      commands.push(`type nul > "${currentPath}"`);
    }
  }
  
  processNode(structure);
  return commands.join("\n");
}

/**
 * Génère des commandes pour créer une structure de dossiers selon le type spécifié
 */
export function generateScriptCommands(
  structure: FolderStructure,
  scriptType: "bash" | "powershell" | "cmd"
): string {
  switch (scriptType) {
    case "bash":
      return generateBashCommands(structure);
    case "powershell":
      return generatePowerShellCommands(structure);
    case "cmd":
      return generateCmdCommands(structure);
    default:
      throw new Error(`Script type not supported: ${scriptType}`);
  }
}