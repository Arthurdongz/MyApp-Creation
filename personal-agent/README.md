# Personal Assistant Agent

A Claude Code setup that acts as a morning personal assistant: email triage,
draft replies, daily priorities, research reports, WhatsApp reply drafts and
help with bills and statements.

## What's inside

```
personal-agent/
├── CLAUDE.md                 # Who you are + the assistant's ground rules
├── .claude/
│   ├── skills/
│   │   ├── morning/          # /morning — daily brief
│   │   ├── inbox/            # /inbox — what matters, clear the junk
│   │   ├── reply/            # /reply — draft emails for approval
│   │   ├── research/         # /research — reports with sources
│   │   ├── whatsapp/         # /whatsapp — paste a message, get a reply
│   │   └── money/            # /money — statements, bills, payment checklists
│   └── agents/
│       ├── inbox-triage.md   # sorts big batches of email (read-only)
│       └── researcher.md     # deep web research
├── notes/                    # priorities + people the assistant remembers
└── inbox-drop/               # drop statements/screenshots here (git-ignored)
```

## Setup (about 15 minutes)

1. **Give it its own repo.** Create a new **private** GitHub repo
   (e.g. `my-assistant`) and copy the contents of this folder into it, so
   Claude Code loads `CLAUDE.md` and `.claude/` from the repo root.
2. **Fill in `CLAUDE.md` → "About me"**, plus `notes/priorities.md` and
   `notes/people.md`. This is what makes it feel personal.
3. **Connect your accounts** at claude.ai → Settings → Connectors:
   - Gmail (or Outlook) for email
   - Google Calendar (or Outlook calendar) for the day's schedule
4. **Start a session** on that repo from the Claude app on your phone
   (claude.ai/code) and say "morning".
5. *(Optional)* Have the brief waiting for you: ask Claude to set up a
   Routine that runs `/morning` every weekday at, say, 06:45.

## A typical morning

```
You:   morning
Agent: ☀️ brief: 3 emails need you, 2 events, top 3 priorities, 14 junk emails
You:   draft replies to 1 and 3, bin the junk
Agent: (shows 2 drafts + the junk list)
You:   send 1, edit 3 to say Thursday instead, yes bin them
You:   reply to this whatsapp: "can you do pick-up tomorrow?"
Agent: (2 reply options to copy)
You:   research half-term activities near me under £30
```

## Deliberate limits

These are design choices, not missing features:

- **No bank logins or payments.** The assistant never holds your bank
  password or codes and never moves money. Emails can carry hidden
  instructions ("pay this invoice") and fake invoices are a common scam, so
  an assistant that can pay is a real risk. Banks' terms also usually
  forbid sharing login details, which can affect fraud refunds. Instead it
  reads statements you download, and prepares a payment checklist that you
  confirm in your banking app in a few taps.
- **WhatsApp is copy-paste.** WhatsApp has no official way for assistants to
  read or send personal chats, and unofficial tools risk getting your number
  banned. Paste the message in, copy the draft out.
- **Nothing is sent or binned without your "yes".**
