#!/usr/bin/env bun

/**
 * Download KV data from Cloudflare and save to dataset/
 *
 * Usage: npm run download-kv
 *
 * Requires:
 * - CLOUDFLARE_ACCOUNT_ID env var
 * - CLOUDFLARE_KV_NAMESPACE_ID env var (the specific KV namespace bound to this project)
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
const KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

if (!ACCOUNT_ID) {
  console.error('Error: CLOUDFLARE_ACCOUNT_ID env var is required');
  console.error('Add it to your .env file');
  process.exit(1);
}

if (!KV_NAMESPACE_ID) {
  console.error('Error: CLOUDFLARE_KV_NAMESPACE_ID env var is required');
  console.error('Find your KV namespace ID in the Cloudflare dashboard under Workers & Pages > KV');
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
  console.log(`Using namespace: ${KV_NAMESPACE_ID}\n`);

  // Ensure dataset directory exists
  if (!existsSync(datasetDir)) {
    mkdirSync(datasetDir, { recursive: true });
  }

  const dateStr = getDateString();

  // Get all keys from the specified namespace
  console.log('Fetching keys...');
  const keysRaw = run(`bun x wrangler kv key list --namespace-id=${KV_NAMESPACE_ID} --remote`);
  const keys = JSON.parse(keysRaw);

  if (keys.length === 0) {
    console.log('No keys found in namespace.');
    return;
  }

  console.log(`Found ${keys.length} key(s)\n`);

  const rows = [];

  for (const keyObj of keys) {
    const key = keyObj.name;
    try {
      const value = run(`bun x wrangler kv key get "${key}" --namespace-id=${KV_NAMESPACE_ID} --remote`);
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
      console.log(`Warning: Could not fetch key "${key}"`);
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
  const filename = `email_signups_${dateStr}.csv`;
  const filepath = join(datasetDir, filename);
  writeFileSync(filepath, csvLines.join('\n'));
  console.log(`Saved ${rows.length} entries to dataset/${filename}`);

  console.log('\nDone!');
}

main().catch(console.error);
