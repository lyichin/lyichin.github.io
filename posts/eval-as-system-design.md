---
title: "Eval as System Design: What I Learned Building the Quality Bar for a Product GTM Agent"
date: 2026-06-17
excerpt: "Most teams treat eval as a checkbox at the end of development. The real answer is more interesting — eval is a system you design, not a step you do."
---

I lead data and AI for an enterprise agentic AI platform. One of the things I'm most often asked about is how we evaluate the agents before they ship. Sharing because most takes I see treat eval as a checkbox at the end of development, and the real answer is more interesting: **eval is a system you design, not a step you do.**

This post is about how I think about it, what I built, and what I'd do differently.

## The starting belief

Most teams ship their first agent on vibes. "It feels good, the demo worked, let's go."

That works exactly until the agent is in front of skeptical, quota-carrying users — at which point one wrong answer about a customer's deal kills trust and they stop using it.

So the first decision I made was: **before we ship anything, we need a quality bar that every release has to clear.** Not a checkbox. A gate. With teeth.

That bar is the thing this post is about.

## What "the bar" actually is

It's a structured eval dataset. Every prompt the agent might face is curated, paired with a golden answer expressed as a structured template (specific data fields, specific formatting), tagged with the action that should fire, and graded twice — once by a human evaluator with a 0/1 score and free-text critique, once by an LLM-as-judge with a 0/1 score.

That last bit is important. We didn't pick one grader. We ran both in parallel.

## Why parallel grading is calibration, not redundancy

This is the move I think most teams miss.

When you scale eval, you eventually want LLM-as-judge to do the work — humans don't scale to thousands of test cases per release. But LLM-as-judge has a quiet failure mode: it drifts away from human judgment in ways you don't notice until you're shipping.

Running both in parallel solves this. **Disagreement between human and LLM grader becomes its own metric.** When humans grade 1 and the LLM grades 0, that case gets pulled into review. Usually the rubric is ambiguous and gets tightened. Sometimes the LLM-judge is systematically miscalibrated on a class of question and we adjust its prompt. The disagreement rate over time is a calibration KPI — we want it converging.

The point isn't "we grade twice for safety." The point is **we measure how much we can trust automated eval before we trust it.**

Skipping this step is how teams ship "automated eval" that quietly drifts and silently approves regressions.

## Match the eval method to the question type

The other move most teams miss: **using the same eval method for everything.**

Different questions need different graders.

| Question type | Right eval method | Why |
|---|---|---|
| Subjective ("did the response answer the user's intent?") | LLM-as-judge | Captures nuance at scale |
| Factual ("did the agent return the correct customer number?") | Exact-match | Deterministic. Hallucinated numbers kill trust. No nuance to grade. |
| Retrieval / ML ("did the lookalike model return relevant accounts?") | Precision@K | Native ML metric for retrieval quality |
| Multi-turn nuance ("did the agent handle this conversation well overall?") | Human eval | Things the model can't grade reliably |

Synthetic gives you scale. Deterministic gives you certainty. Human gives you nuance. **You need all three. Using the wrong eval method on the wrong question type produces noise dressed as a metric.**

For us, the Knowledge Action — RAG-based answers grounded in product documentation — was graded with synthetic LLM-as-judge eval. That hit +88% accuracy on the golden dataset. Customer Info — structured data lookups returning specific fields — was graded with exact-match. The lookalike ML model was graded with Precision@K. Three different evaluators, one cohesive bar.

## The four pre-launch dimensions that actually matter

Generic LLM benchmarks (MMLU, etc.) don't catch the failures that actually erode user trust. We graded the agent across four dimensions designed to catch the failure modes a real user would hit:

**Sequencing.** Does the agent respond consistently and correctly both at the start of a conversation and midway through, after several other prompts? This catches context-window decay, prompt-stuffing degradation, and "the model forgets the system prompt by turn 8."

**Repetition.** If asked the same question across multiple sessions, does the agent return the correct response? This catches stochastic variance — the same user asking the same thing on Monday and Friday getting different answers.

**Robustness.** Are responses consistently correct across multiple users, accounts, and customer profiles? This catches account-specific data leakage, cohort bias, and "works for big customers, fails for small ones."

**Conversation length.** Can the agent bring back information from earlier in a long conversation? This catches long-context recall failure — "I told you 5 turns ago we're talking about Acme."

Why those four: they're the failure modes a real user will actually hit. Each one erodes trust the moment it happens. None of them show up on academic benchmarks.

## What I learned that I didn't expect

Three things turned out to be more important than I'd thought going in.

**1. Most failure was upstream of the model, not in generation.**

When we audited what was failing, the pattern was clear. Most of what we caught wasn't the model generating badly. It was the model generating fine over the wrong inputs — wrong chunks retrieved, stale data, missing context.

That changed how we sequenced engineering work. **Retrieval quality became the first lever. Prompt tuning second. Model upgrade third.** Most teams default to "swap the model." The data says that's usually the smallest lever.

How we caught it: faithfulness scores looked decent — when the agent had the right context, it generated grounded answers. But answer relevancy was lower than it should be, and we kept seeing re-prompt patterns where users asked the same question twice. That contradiction — high faithfulness, high re-prompt — pointed upstream. The retrieval was bringing back something *related* but not *complete*.

**2. Action tagging separates router failure from response failure.**

Every golden prompt was tagged with which action *should* fire. That meant we could grade two distinct failure modes side by side:

- *Right action, wrong output* — the action returned bad data
- *Wrong action, irrelevant output* — the router picked the wrong skill

Without this split, you can't tell which lever to pull. With it, you know whether to invest in the router (intent classification, prompt tuning) or in the action itself (data quality, retrieval).

**3. Behavioral signals matter as much as technical correctness.**

Pre-launch, we focused on technical correctness — accuracy, faithfulness, answer relevancy. Post-launch, we tracked behavioral signals: monthly active users, sessions per user, 7-day retention.

The lesson: **technical correctness can be 99% and adoption can still be zero if users don't trust the agent.** Behavioral signals are the business outcome the technical eval is supposed to drive. Connecting both in one framework — not two separate islands — is what makes the discipline actually work.

## What I'd do differently next time

Two things.

**Session-level outcome tracking from day one.** Today, we score individual prompts. We can see when a single response is wrong. What we can't see, with confidence, is *why an entire conversation failed*. A user has 8 turns with the agent, doesn't act on the recommendation, and we can't yet trace it to a specific failure mode (router picked wrong on turn 3, retrieval was stale on turn 5, agent forgot context by turn 7). Each turn passed individually. The conversation still failed.

We'd build session-level outcome tracking — tying conversation outcomes to specific failure modes — from launch, not as a follow-up. The gap between "did the response meet spec" and "did the user act on it" was the hardest thing to recover after the fact.

**Calibration metric on the dashboard from launch.** Human-vs-LLM grader agreement was something we tracked once we got serious. If we'd shown it from day one, the team would have trusted automated eval faster. Calibration isn't a back-office discipline — it's the trust signal for your trust signal.

## The framing I'm taking forward

When I think about evaluating an AI system now, the question isn't "what's the headline accuracy number?" It's:

- Which questions need *what kind* of eval — subjective, factual, retrieval, behavioral?
- Which failure modes does this user actually hit, and are we testing for those, or just for benchmark performance?
- How do we know our automated grader still agrees with humans?
- Does eval gate releases, or just describe them?
- Are we connecting technical correctness to business outcomes, or measuring them on separate islands?

A mature eval system isn't a metric. It's a discipline that grades the right thing the right way, calibrates itself against ground truth, and feeds back into how the product gets built.

That's what I'd build today.

---

*Part of an ongoing series on building enterprise AI systems. Previous: [locked MCP — open protocol, bounded autonomy](./locked-mcp-agent-architecture.md). Next: where the action dial sits — when to let the system act vs. keep humans in the loop.*

*If you're building eval for a product GTM agent or any agentic system and wrestling with these trade-offs, or you've made different calls and want to compare notes, I'd love to hear about it.*
