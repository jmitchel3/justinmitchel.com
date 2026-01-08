---
title: "Full Send Automation: How to Transition to AI-First"
date: 2026-01-08T10:00:00-05:00
tags: ["AI", "Claude", "Claude Code", "Productivity", "Automation"]
category: "Claude Code"
order: 2
---

Here's how to transition to AI-first.

---

## 1. Create the folder

Create a folder called "Full Send Automation" on your Desktop:

```
Desktop > Full Send Automation
```

---

## 2. Record manual processes using audio

Start with 1 process and do all the steps below. Eventually do all of them.

Narrate it like someone is going to do it for you. Leave errors—do not re-record. Even better if you are actually training someone so their questions show up in the audio.

Remember, AI is listening to this, not humans.

Store the audio files in:
```
Desktop > Full Send Automation > Raw > Audio
```

**Why audio instead of video?**

You may be tempted to do video. Don't. Video creates paralysis and takes far too long to produce. Audio is the bare minimum.

(I've recorded 2k+ 5-20 minute video tutorials if that helps convince you.)

If AI is really not getting your audio transcript down the line then you'll probably have to write the process and maybe include screenshots. I'd argue that AI will understand 90% or more just from your audio recording.

---

## 3. Back up everything now

Audio to Google Drive, Dropbox, OneDrive, External Hard Drive, etc.

---

## 4. Transcribe all audio in detail

Lots of ways to do this but I recommend opening Claude Desktop in Code mode and telling it to use the open-source tool Whisper (from OpenAI):

> "Transcribe the entire folder of `Desktop > Full Send Automation > Raw > Audio` using Whisper and open source code; I need the transcripts to have as much detail as possible. Save them in `Desktop > Full Send Automation > Transcripts`"

---

## 5. Back up everything again

Audio (yes again) and transcripts to Google Drive, Dropbox, OneDrive, External Hard Drive, etc.

---

## 6. Put it all together

Open a *new session* in Claude Desktop in Code mode. Say:

> "Open `Desktop > Full Send Automation`. We need to create a knowledge base in Markdown files optimized for tools like Obsidian based on the `Transcript` folders. Use AskUserQuestionTool if you need any clarifications on the transcripts or knowledge base. In some cases, the transcripts will have overlapping data, that's okay. The first pass of the knowledge base will be rough, we will continue to refine later. I really just need the transcripts organized."

---

## 7. Repeat until everything is documented

---

## Related

- [Start Claude Code Shortcut](/posts/start-claude)
- [What is Vibe Coding?](/posts/vibe-coding-101)
