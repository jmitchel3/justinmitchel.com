#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Get files to check - either from args or all posts
const args = process.argv.slice(2);
const filesToCheck = args.length > 0
  ? args.filter(f => f.endsWith('.md'))
  : fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).map(f => path.join(POSTS_DIR, f));

if (filesToCheck.length === 0) {
  console.log('No markdown files to check.');
  process.exit(0);
}

// Get all valid post slugs
const validSlugs = new Set(
  fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''))
);

let hasErrors = false;

for (const filePath of filesToCheck) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);

  if (!fs.existsSync(absolutePath)) {
    continue;
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const fileName = path.basename(absolutePath);

  // Find all markdown links: [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  let lineNum = 0;
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(line)) !== null) {
      const [, linkText, url] = match;

      // Skip external links and anchors
      if (url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:')) {
        continue;
      }

      // Check /posts/slug links
      if (url.startsWith('/posts/')) {
        const slug = url.replace('/posts/', '').split('#')[0];
        if (!validSlugs.has(slug)) {
          console.error(`${fileName}:${i + 1}: Broken link to /posts/${slug} - post does not exist`);
          hasErrors = true;
        }
      }

      // Check /images/ links
      else if (url.startsWith('/images/')) {
        const imagePath = path.join(PUBLIC_DIR, url);
        if (!fs.existsSync(imagePath)) {
          console.error(`${fileName}:${i + 1}: Broken link to ${url} - image does not exist`);
          hasErrors = true;
        }
      }

      // Check other absolute paths (starting with /)
      else if (url.startsWith('/')) {
        const publicPath = path.join(PUBLIC_DIR, url);
        if (!fs.existsSync(publicPath)) {
          // Could be a route, just warn
          console.warn(`${fileName}:${i + 1}: Warning - cannot verify link to ${url}`);
        }
      }
    }
  }
}

if (hasErrors) {
  console.error('\nBroken links found! Fix them before committing.');
  process.exit(1);
} else {
  console.log('All links valid.');
  process.exit(0);
}
