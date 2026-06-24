---
title: "Eval as System Design: Building the Quality Bar for a Product GTM Agent"
date: 2026-05-30
excerpt: "The agent had to clear a gate, not pass a checkbox. The eval system that emerged graded the agent four ways, by two graders, against the failure modes users would actually hit."
---

> Every eval system has its headline number. What I came to watch more carefully was the metric behind it: agreement between human and LLM grader, the signal that tells you whether accuracy itself is trustworthy.

The agent had to clear a gate, not pass a checkbox.

That was the first decision, and almost everything else followed from it. The product is a Product GTM Agent embedded in seller Slack. Users are AEs and CSMs carrying quotas. They ask things like *who should I sell to next quarter,* *what's changed in this customer's usage,* *what's the run rate.* One wrong number about a customer's deal doesn't fail that query. It fails the agent. Permanently, for that user.

Eval shipping as a post-launch dashboard wouldn't survive that audience. The bar had to exist before launch, and every release had to clear it.

This is the eval system that emerged.

## The dataset

A structured eval set, hand-curated. Every prompt the agent might face is paired with a golden answer expressed as a structured template — specific data fields, specific formatting — and tagged with the action that should fire.

Then every prompt is graded twice.

Once by a human evaluator, with a 0/1 score and a free-text critique. Once by an LLM-as-judge, with a 0/1 score against the same rubric. The two graders see the same prompt, the same response, the same golden answer. They grade independently.

The reason both run is calibration, not redundancy.

## Disagreement as a metric

LLM-as-judge is where eval has to scale. Humans don't grade thousands of test cases per release. The judge has to.

But the judge has a quiet failure mode: it drifts away from human judgment in ways nobody notices until production breaks. You ship a "+88% accuracy" report and the actual user experience is degrading.

The fix was to make disagreement itself a tracked metric.

When the human grades 1 and the LLM grades 0, that case gets pulled into review. Sometimes the rubric is ambiguous — the human and the LLM both have a defensible read. The rubric gets tightened. Sometimes the LLM-judge is miscalibrated on a class of question (it's too lenient on factual hedging, too strict on stylistic variation) — the judge prompt gets adjusted. The disagreement rate over time is the calibration KPI. It should converge.

The day the human-LLM agreement crosses our threshold consistently is the day automated eval has earned the right to gate on its own.

## Different graders for different questions

The other architectural choice: not all questions get the same grader.

| Question type | Grader | Reason |
|---|---|---|
| Subjective ("did the response answer the user's intent?") | LLM-as-judge | Captures nuance at scale |
| Factual ("did the agent return the correct customer number?") | Exact-match | Deterministic. Hallucinated numbers kill trust. No nuance to grade. |
| Retrieval / ML ("did the lookalike model return relevant accounts?") | Precision@K | Native ML metric for retrieval quality |
| Multi-turn nuance ("did the agent handle this conversation well?") | Human eval | Things the model can't grade reliably |

In practice that meant three different evaluators inside one cohesive bar. The Knowledge Action — RAG answers grounded in product docs — ran on LLM-as-judge. Customer Info — structured data lookups — ran on exact-match. The lookalike ML model ran on Precision@K. The Knowledge Action hit +88% accuracy on the golden dataset; the others had their own thresholds.

Using one grader across all of them would have produced numbers, but they wouldn't have meant anything.

## The four pre-launch dimensions

Generic LLM benchmarks (MMLU and the rest) miss the failures that actually erode trust. The eval graded the agent across four dimensions chosen for what a real user would hit:

**Sequencing.** Does the agent respond correctly both at the start of a conversation and midway through, after several other prompts? Catches context-window decay, prompt-stuffing degradation, the system prompt fading by turn 8.

**Repetition.** Same question across multiple sessions, same correct answer? Catches stochastic variance — the user asking the same thing Monday and Friday getting different answers.

**Robustness.** Are responses consistently correct across users, accounts, customer profiles? Catches account-specific data leakage, cohort bias, "works for big customers, fails for small ones."

**Conversation length.** Can the agent recall information from earlier in a long conversation? Catches long-context recall failure: *I told you five turns ago we're talking about Acme.*

These four don't show up on academic benchmarks. They show up on the first day a real user is in a real conversation.

## Three patterns that surfaced

**1. Most failure was upstream of generation.**

When we audited what was breaking, the pattern was consistent. The model wasn't generating badly. It was generating fine over the wrong inputs — wrong chunks retrieved, stale data, missing context.

The faithfulness scores were decent. When the agent had the right context, it grounded the answer. But answer-relevancy lagged, and we kept seeing re-prompt patterns: users asking the same question twice. High faithfulness + high re-prompt rate pointed upstream. The retrieval was returning something *related* but not *complete.*

That changed the engineering order. Retrieval quality became the first lever to pull. Prompt tuning second. Model upgrade third. The instinct to "swap the model" is usually the smallest lever.

**2. Action tagging separated two distinct failure modes.**

Every golden prompt was tagged with the action that *should* fire. That tag let us split:

- *Right action, wrong output* — the action returned bad data
- *Wrong action, irrelevant output* — the router picked the wrong skill

Without the tag, both look identical in the failure logs. With the tag, you know whether the investment goes into the router (intent classification, prompt tuning) or into the action itself (data quality, retrieval).

**3. Technical correctness wasn't enough.**

Pre-launch, the eval framework measured accuracy, faithfulness, answer relevancy. Post-launch, we layered in behavioral signals: monthly active users, sessions per user, 7-day retention.

Technical correctness was 99% in places where adoption was zero. Users weren't bouncing off wrong answers. They were bouncing off answers that were technically correct but didn't feel like what they asked. The behavioral signals were the business outcome the technical eval was supposed to drive. Treating them as separate dashboards — eval over here, product analytics over there — meant the team optimized one and watched the other slip.

The framework had to read both in the same view.

## Two things to do over

**Session-level outcome tracking from day one.**

The eval framework grades prompts. It doesn't yet grade conversations. A user has eight turns with the agent, doesn't act on the recommendation, and we can't trace it back to a specific failure mode: router picked wrong on turn 3, retrieval stale on turn 5, agent forgot context by turn 7. Each turn passed individually. The conversation still failed.

Session-level outcome tracking — tying conversation outcomes to specific failure modes — should have been there from launch. Retrofitting it after the fact is the hardest part of this work.

**Calibration metric on the dashboard from launch.**

Human-vs-LLM grader agreement was something the team treated as internal hygiene at first. The disagreement rate didn't surface in the main dashboard until later. By the time it did, the team had built skepticism toward automated eval that was harder to walk back than it should have been. The calibration metric is the trust signal for the trust signal. It belongs in the main view, not in a quality-of-eval audit.

---

The next piece picks up where this one stops: where the action dial sits between humans and systems, and how a wrong-action budget gets earned over time.
