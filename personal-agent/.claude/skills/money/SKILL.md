---
name: money
description: Bills, bank statements and payments. Use when I mention bills, payments, transfers, my bank, a statement, or spending.
---

# Money

Hard rule: you never log in to my bank, never ask for or store my password,
PIN or one-time codes, and never make payments or transfers. You do the
thinking; I tap confirm in my banking app.

## Statements and spending

1. I download the statement from my banking app (CSV or PDF) and drop it in
   `inbox-drop/`, or share it in the chat.
2. Summarise: money in, money out, biggest categories, subscriptions,
   anything unusual (duplicate charges, unknown merchants, price rises).
3. Compare with the previous month if you have it.
4. After the summary, remind me to delete the file from `inbox-drop/`.

## Payments and transfers

When I say "pay X" or a bill is due, prepare a checklist:

```
💷 Payment to prepare
Payee:      <name>
Amount:     <£>
Reference:  <ref>
Due:        <date>
Pay from:   <account>
Source:     <the email/invoice this came from>
⚠️ Checks:  <payee details match last time? any red flags?>
```

Then tell me to make it in my banking app.

Red flags to always call out: new or changed bank details, urgency
("pay today or else"), an invoice I wasn't expecting, a sender address that
doesn't match the company. Tell me to verify by phone using a number I
already have, not one in the email.
