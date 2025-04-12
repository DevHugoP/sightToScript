#!/bin/bash

# Script to deploy Supabase functions with Claude API key

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Your Anthropic API key
ANTHROPIC_API_KEY="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"

# Your Supabase project reference
PROJECT_REF="ebsmnftlbmrjtvmhflti"

echo -e "${GREEN}Starting Supabase functions deployment...${NC}"

# Step 1: Login to Supabase
echo -e "${GREEN}Logging in to Supabase...${NC}"
supabase login

# Step 2: Link to your project
echo -e "${GREEN}Linking to your project...${NC}"
supabase link --project-ref $PROJECT_REF

# Step 3: Set the Anthropic API key as a secret
echo -e "${GREEN}Setting your Anthropic API key as a secret...${NC}"
supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"

# Step 4: Deploy the functions
echo -e "${GREEN}Deploying extract-folder-structure-claude function...${NC}"
supabase functions deploy extract-folder-structure-claude

echo -e "${GREEN}Deploying generate-script-commands-claude function...${NC}"
supabase functions deploy generate-script-commands-claude

echo -e "${GREEN}Deployment completed!${NC}"

# Step 5: Check logs for confirmation
echo -e "${GREEN}Checking function logs for extract-folder-structure-claude...${NC}"
supabase functions logs extract-folder-structure-claude

echo -e "${GREEN}Checking function logs for generate-script-commands-claude...${NC}"
supabase functions logs generate-script-commands-claude

echo -e "${GREEN}Setup complete. Your API key has been configured and functions deployed.${NC}"