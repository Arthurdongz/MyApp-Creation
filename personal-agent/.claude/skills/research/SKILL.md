---
name: research
description: Research reports. Use when I ask you to research, look into, compare, or find out about something.
---

# Research report

1. If the question is vague, ask one clarifying question (budget, location,
   deadline), then go.
2. Use web search. Prefer official sites, reputable news and primary
   sources. Check prices, opening times and anything time-sensitive against a
   current source and say how recent it is.
3. For bigger topics, hand the digging to the `researcher` subagent.
4. Deliver:

```
🔎 <Topic>

Bottom line: <2–3 sentences answering my actual question>

Key points
- …

Options (if comparing)
| Option | Cost | Pros | Cons |

Sources
1. <title> — <link>
```

5. Say clearly where sources disagree or where you're unsure.
6. If I want to keep it, save it to `notes/research/<topic>.md`.
