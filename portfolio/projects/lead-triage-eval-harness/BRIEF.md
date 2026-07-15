# Lead-Triage Agent Eval Harness — Project Brief

**Week 1 of the AI Eval for Enterprise AI series.**
**Status:** In progress · started 2026-06-14
**Time budget:** 18h hard cap (3h/day × 6 days)
**Owner:** Yichin Lew

---

## Why this project exists

I'm a Product Manager building enterprise AI solutions. The recurring question
across every project I touch is: **how do I embed AI evaluation into the
product so that what we ship is trustworthy?**

I already own a production-agent eval framework at work and shipped an
agentic GTM system to 600+ users. So the gap isn't "what is eval" — it's
*hands-on rigor across the modern eval toolkit, sequenced for the
lifecycle of an enterprise AI product.*

This week-1 project is the **experience** half of that goal. It pairs with
week 2 (the playbook — the *framework* half), with both feeding into a
public learn-and-share series on my site.

After this project I should be able to: walk into a real GTM agent
project, decompose the work into evaluable stages, author rubrics matched
to each stage's shape, calibrate a judge with bias diagnostics, run
multi-model regressions with proper per-slice CI, and ship a Judge Card
that another PM/eng could replicate without me in the room.

---

## What the agent does

A 3-stage GTM agent that triages an inbound lead:

```
raw lead blob
    │
    ▼
[Stage 1] BANT/MEDDIC extraction
    │  (extract structured fields from messy input)
    ▼
[Stage 2] CRM tool selection + execution
    │  (choose tool: account_lookup / contact_create /
    │   opportunity_stage_update; recover from a flaky stub
    │   that 500s ~20% of the time)
    ▼
[Stage 3] Follow-up email draft
    │  (tailored, single CTA, no hallucinated firmographics)
    ▼
final output
```

40 synthetic leads. 4 slice tags: SMB vs ENT × inbound vs outbound, plus
technical-buyer vs economic-buyer, plus clean vs messy-signal.

The agent is the *substrate*. The eval harness is the artifact.

---

## What the eval harness does

The deliberate trick of this project: **three different rubric styles on
one repo**, so I feel the eval-difficulty gradient inside a single build:

| Stage | Rubric style | What it teaches |
|---|---|---|
| 1. Extraction | F1 against gold fields | The cheap, deterministic baseline. Easy to over-rely on. |
| 2. Trajectory | Structural rules over ReAct trace (right tool, right args, recovery valid, no extraneous calls) | Tool-use and agentic recovery — the part most enterprise eval guides skip. |
| 3. Email | LLM-as-judge with 8 binary anchors | Subjective output, where rubric design and judge calibration become load-bearing. |

Plus the cross-cutting harness:
- **Slice-tagged golden set** with adversarial pass on the last 10 leads
- **10-locked canary** held back before judge-prompt authoring (anti-overfitting)
- **Position-bias + length-bias diagnostics** on the email judge
- **Single-labeler kappa** with explicit caveat (mitigation, not solution)
- **Multi-model regression** across Sonnet + Haiku + GPT-4o-mini
- **Cost/latency Pareto** across the three models
- **Local make-eval gate** with bootstrapped per-slice CI lower-bound
- **Judge Card v1** as the portable artifact

---

## What I will and will NOT learn this week

### Will (hands-on, not just read about)
1. Golden dataset curation with slice tags
2. Adversarial dataset probing (lock taxonomy, then break it)
3. Binary-anchored rubric design + when binarization fails
4. Structural F1 on extraction
5. Agent trajectory eval with recovery-on-error
6. Canary-holdout discipline
7. LLM-as-judge calibration vs my own labels
8. Position-bias and length-bias diagnostics
9. Multi-model regression with per-slice CI
10. Cost/latency Pareto reasoning
11. Local regression gating
12. Judge Card discipline (the reusable PM artifact)

### Will NOT (deferred to later weeks in the series)
- Probability calibration / reliability diagrams (week 2 retrofit + week 3)
- Online-vs-offline reconciliation (week 3)
- Drift detection over time (week 3 or 4)
- Multi-cycle critique-shadowing (later week)
- Red-team / safety eval as a blocking gate (later week)
- Autonomy-dial / promotion policy (week 2)
- Eval governance / RACI (week 2)
- Dual-rater inter-annotator agreement (deferred — costs more than it gains for a synthetic v1)

The "what this does NOT evaluate" section is itself a Principal-level
artifact. Naming the gaps is part of the lesson.

---

## Methodology limits I'm acknowledging up front

These go in the post and the Judge Card, not buried at the bottom:

- **Single labeler.** Kappa is judge-vs-self-on-locked-canary, not judge-vs-second-human. The 10-canary-locked-before-judge-prompt protocol mitigates labeler/author conflation but doesn't eliminate it.
- **Synthetic data.** 40 leads I hand-author. Messiness is intentional; per-slice findings should be read as "how the agent behaves on these specific slices," not "how it would behave in production."
- **No real users, no production traffic.** Online/offline reconciliation, drift detection, autonomy-dial work are explicitly out of scope for this week.
- **Three models, not a frontier sweep.** The Pareto plot has three points, not a curve. The technique is demonstrated; the conclusion is local.

Honesty about these is not a weakness in the writeup — it's the signal a senior reviewer is looking for.

---

## Where this fits in the series arc

```
Plan ──── Implement ──── Productionize ──── Enable users ──── Scale (1→1000)
  ▲          ▲                ▲                  ▲                  ▲
  │          │                │                  │                  │
 W2        W1 + W2           W3                W2 + W4              W3 + W4
playbook  this build      reconciliation    autonomy/HITL      drift/economics
```

Week 1 is the **implementation experience** anchor. Week 2 is the
**framework / sequencing** layer that makes week 1's moves portable to
day 0 of any future GTM agent project.

Together, weeks 1+2 are honest ownership of phases 0–4 of an Enterprise
AI agent lifecycle (~85% confidence). Phases 5–6 (rollout, GA, drift,
eval economics) need a week 3 + week 4 to reach 90%+ full-lifecycle
ownership.

---

## Day-by-day plan

| Day | Hrs | Deliverable | Eval technique focus |
|---|---|---|---|
| **Mon** | 3 | 40-lead synthetic golden set, 4 slice tags, gold extractions, gold tool-call sequences. **Lock taxonomy after lead 30**, write the last 10 adversarially to break it. Document what broke. | Golden dataset curation + adversarial probing |
| **Tue** | 3 | 3-stage agent with ReAct JSON trace; stub CRM tools (one 500s ~20% of the time); runs end-to-end on Sonnet over all 40 | Real trajectory + recovery (enabler) |
| **Wed** | 3 | `extraction_rubric.md` (F1), `trajectory_grader.py` (structural rules), `email_rubric.md` (8 binary anchors). **Lock 10 self-graded canary emails BEFORE writing judge prompt.** | Multi-style rubric design + canary discipline |
| **Thu** | 3 | Email judge prompt v1 → run on canary → kappa, position-swap, length-bias → iterate once → kappa v2 | LLM-as-judge calibration + bias diagnostics |
| **Fri** | 3 | Run full harness on Haiku + GPT-4o-mini. Per-slice quality table (4 slices × 3 stages × 3 models). Cost/latency Pareto. Local `make eval` with bootstrapped per-slice CI lower-bound regression check. | Multi-model regression + Pareto + local gate |
| **Sat** | 3 | Judge Card v1 (rubric versions, dataset hash, judge model, biases, kappa, scope limits). Wrap-up post draft. README polish. | Judge Card discipline + working-in-public synthesis |

**Pre-committed cut order if a day overruns:** drop the local regression script first, then drop GPT-4o-mini (keep Sonnet + Haiku). **Do NOT cut**: 10-locked canary, bias diagnostics, Judge Card.

---

## Repo layout

```
lead-triage-eval-harness/
├── BRIEF.md                       # this file
├── README.md                      # 1-page summary + how to run
├── agent/
│   ├── triage_agent.py            # 3-stage agent
│   ├── tools.py                   # stub CRM tools (one is flaky)
│   └── prompts/
├── data/
│   ├── leads_v0.jsonl             # 40 leads, slice-tagged
│   ├── gold_extractions.jsonl     # gold BANT/MEDDIC fields
│   ├── gold_trajectories.jsonl    # gold tool-call sequences
│   ├── canary_emails.jsonl        # 10 locked self-graded
│   └── DATASET_NOTES.md           # adversarial-pass notes, what broke
├── eval/
│   ├── rubrics/
│   │   ├── extraction_rubric.md
│   │   ├── trajectory_grader.py
│   │   └── email_rubric.md
│   ├── judge/
│   │   ├── judge_prompt_v1.md
│   │   ├── judge_prompt_v2.md
│   │   └── calibration_report.md  # kappa, position bias, length bias
│   ├── run_eval.py                # single entrypoint
│   └── make_eval.sh               # local gate
├── results/
│   ├── per_slice_table.md
│   ├── pareto.png
│   └── JUDGE_CARD.md              # the load-bearing artifact
└── posts/
    ├── 01_kickoff.md              # publish before Day 1 (this brief, lightly edited)
    ├── 02_midweek_surprises.md    # mid-build, ugly intermediates
    └── 03_wrapup.md               # what shipped, what cut
```

---

## Three sharing posts (per [user_publishing_voice])

1. **Kickoff** — *"How I scoped a week-1 AI eval project with Claude as a thinking partner."* This brief, lightly edited. Meta-content explicitly framed: scoping with AI is itself the lesson.
2. **Mid-build** — *"Day 3 surprises: where my rubric assumptions broke."* Posted around Wed–Thu. Shows ugly intermediate state, not polished narrative.
3. **Wrap-up** — *"3 rubric styles, 1 repo, and the PM artifact that compounds."* Judge Card + slice-tagged regression methodology as the spine. Disagreement anecdote as a section, not the headline.

A capstone reflection post comes at the end of the full series:
*"Planned vs. actual — what I thought I'd learn about AI eval and what I actually learned."*

---

## Definition of done (Week 1)

The harness is "done" when:

- [ ] 40 leads + gold extractions + gold trajectories committed; adversarial-pass log written
- [ ] Agent runs end-to-end on Sonnet over all 40 leads
- [ ] All three rubrics live with anchor examples
- [ ] Judge prompt v2 has a published kappa number on the locked canary
- [ ] Position-bias and length-bias deltas measured and reported
- [ ] All three models run; per-slice quality table published
- [ ] Cost/latency Pareto plot generated
- [ ] `make eval` exits non-zero on a seeded regression
- [ ] Judge Card v1 published in `/results`
- [ ] Wrap-up post drafted

Cut targets if time runs out are pre-committed (above). The Judge Card,
the canary discipline, and the bias diagnostics are non-negotiable.

---

## How to start (right now)

1. **Pre-warm:** write 5 leads as templates. Don't count this against the 18h.
2. **Day 1 begins:** 3-hour block, no other tabs. Goal: 40 leads + slice tags + golds + adversarial-pass log.
3. **End of Day 1:** push to a private GitHub repo (does not need to be `yichinlew.github.io` — that's the website repo). Create the repo as `lead-triage-eval-harness` so we can track progress and so the brief is public when the kickoff post goes up.

Day 1 starts when you do.
