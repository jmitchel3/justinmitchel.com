---
title: "Before you vibe code, be interviewed by AI."
date: 2025-12-31T07:43:06-05:00
tags: ["AI", "Agents", "Code", "Claude", "Claude Code",]
category: "Vibe Coding"
order: 2
---

> I'm now calling this the _Vibe Interview Method_. It was originally Posted on [x](https://x.com/JustinMitchel/status/2006073815747399742?s=20). 

Before you vibe code, be interviewed by AI. Here's how:

- Download [Claude Code](https://code.claude.com/docs/en/overview) (different from [Claude Desktop](https://claude.ai/download))
- Install it with your Command Line (terminal, powershell, wsl, etc)
- Write a basic project spec file such as  `Accounting software for YouTube creators` in `spec.md`
- In your terminal, run `claude --model opus` to start Claude Code. Make sure it's next to `spec.md`
- In your claude session type:

```plaintext
read the spec.md file and interview me in detail using the AskUserQuestionTool about literally anything: technical implementation, UI & UX, concerns, tradeoffs, etc. but make sure the questions are not obvious

be very in-depth and continue interviewing me continually until it's complete, then write the output spec to the file
```

Claude will interview you with multi-choice questions. The detail is on point. 

Once you have this built out, you can continue to refine it. Bring it to other LLMs to challenge you on it as well. Once you make changes, repeat.

Here's what it will look like:

[![Claude AskUserQuestionTool Session Example](/images/vibe-interviews-claude-code.jpeg)](/images/vibe-interviews-claude-code.jpeg)



A few questions you might have:
- **What's the [AskUserQuestionTool](/posts/claude-ask-user-question-tool)?**
- **What's [vibe coding](/posts/vibe-coding-101)?**
- **Regarding the rinse and repeat: what's the best signal that you've reached a point of diminishing returns?** [og source](https://x.com/gniting/status/2006421568935616992?s=20)

    At some point you’ll need to start building. 

    I think 2-3 iterations is more than enough to start. I’m sure it’s different for each project based on the level of complexity of the project. 
    
    Those iteration question should be a signal too, if there are questions that are “oh I never thought about that” I’d keep going until you move into “yeah this will be down the line.”