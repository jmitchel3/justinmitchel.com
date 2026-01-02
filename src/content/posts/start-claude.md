---
title: "Start Claude Code Shortcut"
date: 2026-01-02T10:00:00-05:00
tags: ["AI", "Claude", "Claude Code", "Productivity", "Shortcuts"]
category: "Claude Code"
order: 1
---

Start Claude Code in any project folder with a simple double-click.

---

## For Mac

1. **Open Terminal** and run this command:
```bash
mkdir -p ~/Documents/claude-shortcuts && echo -e '#!/bin/bash\ncd "$(dirname "$0")"\nclaude' > ~/Documents/claude-shortcuts/start-claude.command && chmod +x ~/Documents/claude-shortcuts/start-claude.command && open ~/Documents/claude-shortcuts
```

2. **Finder opens** showing your new `start-claude.command` file

3. **Copy it** to any project folder, then double-click to start Claude Code there

---

## For Windows

1. **Open Command Prompt** and run this command:
```cmd
mkdir "%USERPROFILE%\Documents\claude-shortcuts" 2>nul & (echo @echo off & echo cd /d "%%~dp0" & echo claude) > "%USERPROFILE%\Documents\claude-shortcuts\start-claude.bat" & explorer "%USERPROFILE%\Documents\claude-shortcuts"
```

2. **Explorer opens** showing your new `start-claude.bat` file

3. **Copy it** to any project folder, then double-click to start Claude Code there

---

## Want this in multiple folders?

Just copy the file into each folder where you want quick access to Claude Code.

---

## The manual, more technical way

If you prefer to create the files by hand:

**Mac (start-claude.command):**
```bash
mkdir -p ~/Documents/claude-shortcuts
cd ~/Documents/claude-shortcuts
nano start-claude.command
```

In `start-claude.command` add:
```bash
#!/bin/bash
cd "$(dirname "$0")"
claude
```
Save the file and exit (`ctrl+x`, then `y`, then `Enter`)

Then run:
```bash
chmod +x start-claude.command
```
Now you can copy it where you want:

```bash
mkdir -p ~/Desktop/my-project
cp ~/Documents/claude-shortcuts/start-claude.command ~/Desktop/my-project
```
or
```bash
open ~/Documents/claude-shortcuts
```


**Windows (start-claude.bat):**
```cmd
mkdir "%USERPROFILE%\Documents\claude-shortcuts"
cd "%USERPROFILE%\Documents\claude-shortcuts"
notepad start-claude.bat
```

In `start-claude.bat` add:
```batch
@echo off
cd /d "%~dp0"
claude
```
Save the file and close Notepad.

Now you can copy it where you want:
```cmd
mkdir "%USERPROFILE%\Desktop\my-project"
copy start-claude.bat "%USERPROFILE%\Desktop\my-project"
```
or
```cmd
explorer "%USERPROFILE%\Documents\claude-shortcuts"
```

---

## Security Concerns?

Copying code from the internet should raise alarm bells. Copy this whole page and give it to ChatGPT, Claude, Grok, or any LLM. It will tell you this is safe. 



---

## Related

- [Before you vibe code, be interviewed by AI](/posts/vibe-interview)
- [What is Claude Code?](https://docs.anthropic.com/en/docs/claude-code/overview)
