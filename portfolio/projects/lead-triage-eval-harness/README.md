# Lead-Triage Agent Eval Harness

A 3-stage GTM agent (BANT/MEDDIC extraction → CRM tool-call → follow-up email)
graded with three different eval methods, surfacing per-slice quality regressions
across model versions.

**Week 1 of the [AI Eval for Enterprise AI series](../../). Status: in progress.**

See [BRIEF.md](./BRIEF.md) for full project context, day-by-day plan, methodology
limits, and how this fits the Enterprise AI PM lifecycle arc.

## TL;DR

- **Agent:** synthetic GTM lead-triage with real trajectory choice + recovery on flaky tool
- **Dataset:** 40 hand-authored leads, 4 slice tags, gold extractions, last 10 written adversarially
- **Rubrics:** F1 on extraction, structural grader on trajectory, binary-anchored LLM-as-judge on email
- **Models:** Claude Sonnet, Claude Haiku, GPT-4o-mini
- **Reportable artifact:** Judge Card v1 + per-slice quality table + cost/latency Pareto

## Run

```bash
make eval                # runs full harness, exits non-zero on regression
```

## Structure

See [BRIEF.md § Repo layout](./BRIEF.md#repo-layout).
