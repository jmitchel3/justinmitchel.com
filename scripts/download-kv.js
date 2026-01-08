#!/usr/bin/env node

/**
 * Download all KV data from Cloudflare and save to dataset/
 *
 * Usage: npm run download-kv
 *
 * Requires:
 * - CLOUDFLARE_ACCOUNT_ID env var
 * - Logged into wrangler (npx wrangler login)
 */

import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const datasetDir = join(projectRoot, 'dataset');

// Load .env file manually (no external dependencies)
function loadEnv() {
  const envPath = join(projectRoot, '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!ACCOUNT_ID) {
  console.error('Error: CLOUDFLARE_ACCOUNT_ID env var is required');
  console.error('Add it to your .env file or run: CLOUDFLARE_ACCOUNT_ID=xxx npm run download-kv');
  process.exit(1);
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID } });
  } catch (e) {
    console.error(`Command failed: ${cmd}`);
    console.error(e.stderr || e.message);
    process.exit(1);
  }
}

function getDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  console.log('Downloading KV data from Cloudflare...\n');

  // Ensure dataset directory exists
  if (!existsSync(datasetDir)) {
    mkdirSync(datasetDir, { recursive: true });
  }

  // List all KV namespaces
  console.log('Fetching KV namespaces...');
  const namespacesRaw = run('npx wrangler kv namespace list --json');
  const namespaces = JSON.parse(namespacesRaw);

  if (namespaces.length === 0) {
    console.log('No KV namespaces found.');
    return;
  }

  console.log(`Found ${namespaces.length} namespace(s):\n`);

  for (const ns of namespaces) {
    console.log(`  - ${ns.title} (${ns.id})`);
  }

  console.log('\n');

  const dateStr = getDateString();

  // Download keys and values from each namespace
  for (const ns of namespaces) {
    console.log(`Downloading from "${ns.title}"...`);

    // Get all keys
    const keysRaw = run(`npx wrangler kv key list --namespace-id=${ns.id} --json`);
    const keys = JSON.parse(keysRaw);

    if (keys.length === 0) {
      console.log(`  No keys found in ${ns.title}\n`);
      continue;
    }

    console.log(`  Found ${keys.length} key(s)`);

    const rows = [];

    for (const keyObj of keys) {
      const key = keyObj.name;
      try {
        const value = run(`npx wrangler kv key get "${key}" --namespace-id=${ns.id}`);
        let parsed;
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = { raw: value.trim() };
        }

        // Flatten the data for CSV
        rows.push({
          key,
          email: parsed.email || '',
          firstName: parsed.firstName || '',
          timestamp: parsed.timestamp || '',
          synced: parsed.synced !== undefined ? String(parsed.synced) : '',
        });
      } catch (e) {
        console.log(`  Warning: Could not fetch key "${key}"`);
        rows.push({ key, email: '', firstName: '', timestamp: '', synced: '' });
      }
    }

    // Build CSV
    const headers = ['key', 'email', 'firstName', 'timestamp', 'synced'];
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      csvLines.push(headers.map(h => escapeCSV(row[h])).join(','));
    }

    // Save CSV with date
    const safeName = ns.title.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeName}_${dateStr}.csv`;
    const filepath = join(datasetDir, filename);
    writeFileSync(filepath, csvLines.join('\n'));
    console.log(`  Saved to dataset/${filename}\n`);
  }

  console.log('Done! Check the dataset/ folder.');
}

main().catch(console.error);
