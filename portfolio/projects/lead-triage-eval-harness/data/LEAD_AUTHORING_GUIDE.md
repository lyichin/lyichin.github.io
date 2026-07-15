# Lead Authoring Guide

How to write the 40 synthetic leads + gold labels for the Lead-Triage Eval Harness.

**Default product context:** We sell a **developer observability platform**
(logs + traces + metrics for engineering teams). SMB = 50–500 employees;
ENT = 500+ employees. Swap if you want a different product universe — but
swap *now*, before you start, so the universe stays coherent.

---

## The 4-axis slice taxonomy (LOCKED after lead 30)

Every lead gets exactly one tag from each axis. 16 cells total. Goal:
hit each cell at least once across the first 30 leads.

| Axis | Tag A | Tag B |
|---|---|---|
| **Size** | `SMB` (50–500 emp) | `ENT` (500+ emp) |
| **Direction** | `inbound` (they reached us) | `outbound` (we're prospecting them) |
| **Buyer type** | `technical-buyer` (Eng / Platform / SRE) | `economic-buyer` (CFO / VP Finance / RevOps / Procurement) |
| **Signal quality** | `clean-signal` (BANT mostly extractable) | `messy-signal` (typos / ambiguous / contradictions / partial) |

**The adversarial last-10 rule:**
After lead 30, the slice taxonomy is locked. The last 10 leads should be
deliberately written to **break the taxonomy or the rubrics**. Examples
of what "breaks":
- A lead that doesn't fit any of the 16 cells cleanly
- A lead where `economic-buyer` and `technical-buyer` are the same person
- A lead with so much noise that BANT extraction is genuinely impossible
- A lead where the *correct* CRM action is **no action** (refusal correctness)
- A lead where the buyer is a competitor, partner, or current customer

Document each break in `DATASET_NOTES.md` as you go.

---

## What a lead actually IS

A `raw_blob` field — the messy text the agent sees. Source decides shape:

### Inbound shape
A web form submission, support ticket, sales-page reply, or webinar
follow-up. Fields the agent might see:
```
Company: <name>
Name: <person>
Title: <role>
Email: <email>
Source: <pricing page | webinar | demo request | etc.>
Message: <free text — this is where BANT signals live>
```

### Outbound shape
Account research output, BDR briefing note, or trigger-event signal.
Fields the agent might see:
```
Account: <name> (<size> emp, <industry>, <funding stage>)
Trigger: <why we're prospecting them now>
Tech stack: <visible tools — LinkedIn / BuiltWith / job posts>
Target contact: <name>, <title>, <tenure / background>
Signal source: <blog post | hiring | funding | tool migration | etc.>
```

Both shapes can be `clean-signal` or `messy-signal`. See palette below.

---

## Gold labels per lead

Each lead needs **two** gold artifacts (paired files, same `lead_id`):

### `gold_extractions.jsonl` — BANT extraction
```json
{
  "lead_id": "L001",
  "extraction": {
    "budget": {"status": "stated|inferred|unknown", "amount": "string or null"},
    "authority": "decision-maker|influencer|unknown",
    "need": "one-sentence description or null",
    "timeline": "weeks|this quarter|next quarter|unknown"
  }
}
```

### `gold_trajectories.jsonl` — CRM tool-call sequence
```json
{
  "lead_id": "L001",
  "trajectory": [
    {"tool": "account_lookup", "args": {"name": "Stripe"}},
    {"tool": "contact_create", "args": {"name": "Sarah Chen", "email": "sarah.chen@stripe.com", "title": "VP Engineering", "account_id": "<from_lookup>"}},
    {"tool": "opportunity_stage_update", "args": {"account_id": "<from_lookup>", "stage": "qualified"}}
  ],
  "email_should": [
    "Reference the specific pain (cost ceiling on observability)",
    "Acknowledge their stated 6-week timeline",
    "Single CTA to book a demo",
    "No fabricated firmographics or mutual contacts"
  ]
}
```

The three stub CRM tools (defined in `agent/tools.py` later):
- `account_lookup(name)` → returns account record or `{"status": "not_found"}`
- `contact_create(name, email, title, account_id)` → creates contact
- `opportunity_stage_update(account_id, stage)` → updates pipeline

**The flaky one:** `account_lookup` 500s ~20% of the time. Gold trajectory
should show one retry then proceed.

**Refusal-correct trajectories exist.** If the lead is a competitor, a
partner, or out-of-ICP, gold trajectory is **empty list** + `email_should`
is `["Politely decline / route to right team"]`. ~3–5 leads should be
refusal-correct.

---

## Messiness palette (for `messy-signal` leads + the adversarial 10)

Mix and match. Document which mess you used in `DATASET_NOTES.md` so
post-hoc analysis can see which mess types each model handles.

| Mess type | Example |
|---|---|
| **Typo in entity name** | "Strip" instead of "Stripe"; "Snwoflake" |
| **Ambiguous title** | "Director of Operations at 50-person co" — technical or economic? |
| **Contradictory size signals** | Form says "small team," LinkedIn says 500 emp |
| **Partial BANT** | Webinar attendance only, no message content |
| **Buried BANT** | Budget mentioned in passing inside a 6-paragraph rant |
| **Multi-buyer** | One email, two stakeholders cc'd, different priorities |
| **Stale signal** | Trigger event 14 months old |
| **Off-topic noise** | Lead asks 80% about a product we don't sell |
| **Price objection up front** | "We can't afford anything over $X" — tests refusal vs negotiation |
| **Wrong product fit** | They want what we don't sell — refusal correctness |
| **Existing customer** | Already has us; this is expansion / support / churn risk |
| **Competitor / partner** | Outbound-targeted but turns out to be a competitor employee |

---

## Authoring rhythm (Day 1, ~3 hours)

| Stretch | Time | Output |
|---|---|---|
| Pre-warm | 15 min (uncounted) | 5 lead templates, one per cell of the most common slices |
| Block 1 | 60 min | Leads 1–15 with golds — work the 16 cells systematically |
| Block 2 | 60 min | Leads 16–30 with golds — fill underrepresented cells |
| **Lock taxonomy** | 5 min | Snapshot the cell distribution; commit `SLICE_TAXONOMY.md` as v1 |
| Block 3 | 50 min | Leads 31–40 — adversarial pass, document each break in `DATASET_NOTES.md` |
| Buffer | 10 min | Spot-check a few golds for consistency |

**Per-lead budget: ~3.5 minutes including gold.** Tight but workable
once you have the seed examples below.

---

## Seed leads (6 working examples)

These live in `leads_seed.jsonl` and span the corners of the taxonomy.
Use as patterns. Don't include them in the final 40 — they're scaffolding,
not product.

| ID | Slice | Mess type |
|---|---|---|
| S001 | SMB inbound technical-buyer clean-signal | (none) |
| S002 | ENT inbound economic-buyer messy-signal | Ambiguous title + buried BANT |
| S003 | SMB outbound technical-buyer clean-signal | (none) |
| S004 | ENT outbound economic-buyer clean-signal | (none) |
| S005 | ENT inbound technical-buyer messy-signal | Typo in company + contradictory size |
| S006 | SMB outbound economic-buyer messy-signal | Refusal-correct: existing customer |

See [`leads_seed.jsonl`](./leads_seed.jsonl) for full text + paired golds
in [`golds_seed.jsonl`](./golds_seed.jsonl).

---

## When in doubt

- **Realism over polish.** Real leads have grammar errors, missing fields, copy-paste artifacts. Don't over-clean.
- **One signal, one slice.** If a lead could fit two slices, pick one and write the *other* signal in a different lead.
- **Gold first, blob second when stuck.** Decide what the agent SHOULD do, then write a blob that demands it.
- **Don't seed the agent's failure modes you'll grade on.** If you write a blob with a fabricated mutual contact AND your email rubric punishes fabricated mutual contacts, you've hand-built the test you're about to grade. The adversarial-10 pass is where deliberate seeding is appropriate; the first 30 should be representative, not gotchas.
