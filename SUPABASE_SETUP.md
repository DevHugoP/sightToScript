# Supabase Functions Setup Guide

This guide explains how to set up and deploy the Supabase Edge Functions for image processing with Claude AI.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- An [Anthropic API key](https://www.anthropic.com/api) for Claude AI

## Setting Up the Supabase CLI

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref ebsmnftlbmrjtvmhflti
   ```

## Deploying Functions with Anthropic API Key

1. Set your Anthropic API key as a secret:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=your_api_key_here
   ```

2. Deploy the Claude AI functions:
   ```bash
   supabase functions deploy extract-folder-structure-claude
   supabase functions deploy generate-script-commands-claude
   ```

## Verifying Deployment

After deployment, the functions should be available at:
- https://ebsmnftlbmrjtvmhflti.supabase.co/functions/v1/extract-folder-structure-claude
- https://ebsmnftlbmrjtvmhflti.supabase.co/functions/v1/generate-script-commands-claude

## Troubleshooting

If you encounter any errors:

1. Verify that your Anthropic API key is correctly set:
   ```bash
   supabase secrets list
   ```

2. Check the logs for any error messages:
   ```bash
   supabase functions logs extract-folder-structure-claude
   supabase functions logs generate-script-commands-claude
   ```

3. Make sure you're using a valid Anthropic API key with access to Claude's vision capabilities.