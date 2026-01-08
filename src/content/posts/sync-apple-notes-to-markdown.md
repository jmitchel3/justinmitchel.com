---
title: "Sync Apple Notes to Markdown"
date: 2025-01-07T12:00:00-05:00
tags: ["Automation", "Python", "macOS", "Apple Notes", "Productivity"]
category: "Tips"
---

How to get Apple Notes in Markdown format? The code below answers that question. Yes, it was written by Claude Code but I tested it.

But why Markdown?

- Markdown has become *the* format for AI Agents especially Claude Code
- Markdown can be plain English or include code snippets (like this exact blog post is written in markdown)
- HTML Markup is what inspired Markdown. HTML Markup sucks to write. Markdown is easy. 
- Markdown has always been my go-to for writing technical content
- It's plaintext at it's core (no vendor-specific artifacts like `.doc` or `.pages`)
- Markdown is great for blog articles
- The format is easy to learn.
- Reddit and many sites support markdown for comments (even if it's basic markdown)

Okay cool. Anything else? Well yes. I am officially a [obsidian.md](https://obsidian.md) fan. Why?

- Obsidian takes what I love about Apple Notes and brings Markdown front and center.
- Obsidian is a free app unless you use their services to Sync or Publish. I use just Sync so iPhone version of Obsidian has the same stuff
- All files are stored as `.md` so you can use any or all of the document sync services you might already use: iCloud, Dropbox, One Drive, Google Drive, Github, AWS S3, Cloudflare R2, with or without Obsidian Sync.

Here's a script you can use to extract your Apple notes too:

## Python Script

```python
#!/usr/bin/env python3
"""
Sync Apple Notes to Markdown files.

Usage:
    uv run sync_apple_notes.py [--output-dir PATH] [--watch]

Dependencies are managed inline via uv script syntax.
"""
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "html2text",
# ]
# ///

import subprocess
import json
import re
import os
import sys
import argparse
import time
from pathlib import Path
from datetime import datetime

import html2text


def get_notes_via_jxa(verbose: bool = True) -> list[dict]:
    """Use JavaScript for Automation to extract notes from Apple Notes."""

    # First, get note count for progress reporting
    if verbose:
        count_script = 'Application("Notes").notes().length'
        count_result = subprocess.run(
            ["osascript", "-l", "JavaScript", "-e", count_script],
            capture_output=True,
            text=True
        )
        if count_result.returncode == 0:
            total = count_result.stdout.strip()
            print(f"Found {total} notes, fetching content (this may take a few minutes)...")

    # Use a more efficient approach: process in batches and output progress via stderr
    jxa_script = '''
    const app = Application("Notes");
    const notes = [];
    let count = 0;
    const total = app.notes().length;

    for (const folder of app.folders()) {
        const folderName = folder.name();
        for (const note of folder.notes()) {
            try {
                notes.push({
                    id: note.id(),
                    name: note.name(),
                    folder: folderName,
                    body: note.body(),
                    creationDate: note.creationDate().toISOString(),
                    modificationDate: note.modificationDate().toISOString()
                });
                count++;
                if (count % 25 === 0) {
                    ObjC.import("Foundation");
                    const msg = `  Progress: ${count}/${total} notes...\\n`;
                    $.NSFileHandle.fileHandleWithStandardError.writeData($(msg).dataUsingEncoding($.NSUTF8StringEncoding));
                }
            } catch (e) {
                // Skip notes that can't be read
            }
        }
    }

    JSON.stringify(notes);
    '''

    result = subprocess.run(
        ["osascript", "-l", "JavaScript", "-e", jxa_script],
        capture_output=False,
        text=True,
        stdout=subprocess.PIPE
    )

    if result.returncode != 0:
        print("Error accessing Apple Notes", file=sys.stderr)
        print("\nMake sure Terminal/your app has access to Apple Notes in:", file=sys.stderr)
        print("System Settings > Privacy & Security > Automation", file=sys.stderr)
        sys.exit(1)

    return json.loads(result.stdout.strip())


def html_to_markdown(html_content: str) -> str:
    """Convert HTML content from Apple Notes to Markdown."""
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = False
    h.body_width = 0  # Don't wrap lines
    h.ignore_emphasis = False
    h.single_line_break = True

    markdown = h.handle(html_content)

    # Clean up extra whitespace
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)

    return markdown.strip()


def sanitize_filename(name: str) -> str:
    """Create a safe filename from note title."""
    # Remove or replace invalid characters
    safe = re.sub(r'[<>:"/\\|?*]', '', name)
    safe = re.sub(r'\s+', ' ', safe).strip()
    # Limit length
    if len(safe) > 100:
        safe = safe[:100]
    return safe or "Untitled"


def sync_notes(output_dir: Path, verbose: bool = True) -> dict:
    """Sync all Apple Notes to markdown files in output_dir."""

    notes = get_notes_via_jxa(verbose=verbose)

    if verbose:
        print(f"Processing {len(notes)} notes...")

    stats = {"created": 0, "updated": 0, "skipped": 0}

    for note in notes:
        # Create folder structure
        folder_name = sanitize_filename(note["folder"])
        folder_path = output_dir / folder_name
        folder_path.mkdir(parents=True, exist_ok=True)

        # Create filename
        note_name = sanitize_filename(note["name"])
        file_path = folder_path / f"{note_name}.md"

        # Convert content
        markdown_content = html_to_markdown(note["body"])

        # Add metadata header
        mod_date = note["modificationDate"][:10]
        create_date = note["creationDate"][:10]

        full_content = f"""---
title: {note["name"]}
folder: {note["folder"]}
created: {create_date}
modified: {mod_date}
---

{markdown_content}
"""

        # Check if file needs updating
        if file_path.exists():
            existing = file_path.read_text(encoding="utf-8")
            if existing == full_content:
                stats["skipped"] += 1
                continue
            stats["updated"] += 1
        else:
            stats["created"] += 1

        file_path.write_text(full_content, encoding="utf-8")

        if verbose:
            action = "Updated" if stats["updated"] > stats["created"] else "Created"
            print(f"  {action}: {folder_name}/{note_name}.md")

    return stats


def watch_mode(output_dir: Path, interval: int = 60):
    """Continuously sync notes at specified interval."""
    print(f"Watching Apple Notes, syncing every {interval} seconds...")
    print("Press Ctrl+C to stop\n")

    try:
        while True:
            stats = sync_notes(output_dir, verbose=False)
            timestamp = datetime.now().strftime("%H:%M:%S")

            if stats["created"] or stats["updated"]:
                print(f"[{timestamp}] Created: {stats['created']}, Updated: {stats['updated']}")
            else:
                print(f"[{timestamp}] No changes")

            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nStopped watching")


def main():
    parser = argparse.ArgumentParser(description="Sync Apple Notes to Markdown")
    parser.add_argument(
        "--output-dir", "-o",
        type=Path,
        default=Path.cwd(),
        help="Output directory for markdown files (default: current directory)"
    )
    parser.add_argument(
        "--watch", "-w",
        action="store_true",
        help="Continuously watch and sync notes"
    )
    parser.add_argument(
        "--interval", "-i",
        type=int,
        default=60,
        help="Sync interval in seconds for watch mode (default: 60)"
    )

    args = parser.parse_args()

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Output directory: {output_dir}\n")

    if args.watch:
        watch_mode(output_dir, args.interval)
    else:
        stats = sync_notes(output_dir)
        print(f"\nDone! Created: {stats['created']}, Updated: {stats['updated']}, Unchanged: {stats['skipped']}")


if __name__ == "__main__":
    main()
```

## Usage
You'll need to install [Astral's UV](https://docs.astral.sh/uv/getting-started/installation/) so you can:

```bash
# One-time sync to current directory
uv run sync_apple_notes.py

# Sync to a specific directory
uv run sync_apple_notes.py --output-dir ~/Documents/notes

# Watch mode - continuously sync every 60 seconds
uv run sync_apple_notes.py --watch

# Watch mode with custom interval
uv run sync_apple_notes.py --watch --interval 30
```
