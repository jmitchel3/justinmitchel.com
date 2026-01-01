---
title: "Agent Workshop"
date: 2026-01-01T00:00:00-05:00
tags: ["AI", "Claude Code", "Automation"]
draft: true
category: "Claude Code"
---

In this world of AI Agents, what do we do with our Raspberry Pis and old computers lying around?

Here's an idea: build an Agent Workshop.

- Install Linux on all devices (including old Macs/Windows, possibly even iOS/Android)
- Network them as a local data center or your own local private cloud
- Use Claude Code to help you set it up; there's a lot of excellent homelab content to help if needed
- Internet access for this local cloud is probably optional. If anything, you might just need outgoing (egress) and not incoming (ingress) to the public internet
- Install open source LLMs on this local cloud. Again, use Claude Code to do this with/for you
- Your local LLM cloud could also have databases (Postgres, Timescale, MySQL, Redis, etc.), object storage (there's open source that works like S3), and Dropbox-like file syncing (as in where they got the original idea from)
- Hold regular Claude Code interviews via the AskUserQuestionTool (see linked post below)
- Create an LLM Council that takes your interview data (spec.md, features/something/spec.md, etc) and have the LLM Council (1) challenging your spec and (2) delegating it to your local LLM cloud
- If challenged, more interviews should be scheduled with you and Claude Code
- If delegated, let your local LLM cloud do the work
- If delegated tasks fail, the LLM council picks up the slack. If still fails, issues are created in some issue tracker so you and Claude Code can address them
- Claude Code and the LLM Council can spin up applications as needed to accomplish tasks and deploy them to your local and private cloud. You'd probably want to use Docker but I'd assume Claude Code would point that out as well. These applications would be 100% disposable or you could keep them forever. Either way, if they do their job, that's exactly what we need them for

## To what end?

Suppose you built an entire pipeline to answer the question: "Are these 100 podcast episodes worth listening to?"

Your Claude Code driven, Raspberry Pi local cloud could then:

- Download podcasts
- Transcribe them with open source tech (Whisper)
- Use open source LLMs to summarize and keyword extract
- Local cloud LLMs can decide which pass the "smell" test to surface them to the LLM council
- The LLM council can review the transcript and challenge the validity of listenability
- LLM council can argue if you'd enjoy it
- Finally, the podcast episodes worth hearing get sent to you. Heck, it could have built-in tracking so your LLM Council can later understand if you liked it or not or if they succeeded. If they failed, they could create a failure report for later Claude Code interviews to help address

## The Beauty of It

Do we all need or want this? No. Claude Code can help you build it anyway.

The beauty of this is I know that anyone could build this as long as you have grit. You no longer need the technical knowhow to do it. Just Claude Code and some patience.

The other beauty of this is how scalable it is. You can start with 1 Raspberry Pi and maybe an external hard drive. You could start with 1 podcast episode and scale up to 1,000, 10,000, or possibly even *all* podcast episodes. You're not building a server that needs to handle a whole office, just what you need. As you use it more, you can scale it more. If you want to do something else, I'm sure your LLM council could offer up some suggestions.

Buckle up, 2026 and beyond is going to be incredible.