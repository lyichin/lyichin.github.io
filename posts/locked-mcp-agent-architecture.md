---
title: "Locked MCP: Why Your Agent Should Have an Open Protocol but Not Free-Form SQL"
date: 2026-06-17
excerpt: "Most takes on MCP are either MCP for everything or MCP isn't ready. The senior call is what migrates and what doesn't."
---

I lead data and AI for an enterprise agentic AI platform. Recently I've been thinking through how the architecture evolves from where we are today to where it should go. Sharing because the trade-offs matter, and most takes I see are either "MCP for everything" or "MCP isn't ready" — and the real answer is more interesting.

## The starting point: an agent is a router over heterogeneous tools

The product I'll reference here is a Product GTM Agent — embedded in seller Slack, helping AEs and CSMs reason over product-usage signals to figure out who to sell, when, and what next. It's an orchestrator. It doesn't do one thing. It picks from a set of capabilities — knowledge retrieval, customer-data lookup, ML-based account comparison, rule-based playbook recommendations, deal-sizing calculations — and chains them into a response.

That's the senior framing of "what is an agent." Not a chatbot. Not a RAG system. **A router over heterogeneous tools.**

Today, every tool is a bespoke integration. SageMaker for ML inference. Custom database wrappers for structured lookups. Vector DB calls for RAG. They work, they're fast, they're stable.

But adding a new tool is an engineering project. And every new tool deepens our coupling to one stack.

## Why MCP

The Model Context Protocol (MCP) is the open standard for connecting AI agents to external tools and data. The pitch:

- One protocol, any vendor, any LLM
- Tools self-describe via schemas, docstrings, and capabilities
- Agents discover tools at runtime instead of being hard-coded

For a future-state architecture, MCP is the right north star. Faster capability addition. Multi-LLM portability. Cleaner governance. Open ecosystem.

But "MCP for everything" is a junior take. The senior call is **what migrates and what doesn't.**

## What stays bespoke

Three workloads are better served by bespoke integration:

**ML model inference.** Lookalike models running on SageMaker — native integration is faster than wrapping the endpoint in MCP. ML inference is already the latency bottleneck. Don't add a protocol hop.

**Tight external app loops.** A deal-sizing calculator has its own auth, state, and call patterns. MCP wrapping it adds overhead without unlocking new capability.

**Hot-path actions with stable surface area.** If a capability isn't going to grow or change much, the engineering cost of migration outweighs the benefit.

## What migrates

Everything that's essentially "query a warehouse and return fields."

Customer info lookup. Customer journey funnel data. Knowledge search. Use case retrieval. These all reduce to structured queries against Snowflake, vector databases, or curated data tables.

The capability unlock is huge. Today, every metric is a hand-written SQL inside a custom action. Adding a new metric is an engineering ticket. With a Snowflake MCP server, the agent can answer **anything the data can answer** — not just the queries we anticipated.

## The trap I almost fell into

When I sketched this out, my first instinct was: "Snowflake MCP server, expose the schema, let the agent compose queries on the fly. Massive capability expansion."

That's where I caught myself.

Our users are quota-carrying sellers. A wrong number kills trust. Our consumption metrics have heavy nuance — aggregation rules, dedup, multi-contract handling, schedule-elapsed checks for run-rate volatility. There's no realistic way to teach a free-form SQL-composing agent all that nuance and trust it to apply it 100% of the time.

So I changed the design.

## Locked MCP

The compromise: expose **only curated tools** via MCP. No free-form SQL.

```
Snowflake MCP Server
├── get_consumption_run_rate(account_id, time_window)
│   SQL pre-baked. Aggregation, dedup, volatility check inside.
├── get_funnel_stage_breakdown(region, operating_unit)
│   6-stage universal model. Stuck-flag handling inside.
├── get_account_usage_profile(account_id)
│   Curated golden-template output.
│
└── (no run_query exposed)
```

The agent picks the right tool based on the user's question and passes parameters. It never writes SQL.

This gives me MCP's benefits — open protocol, multi-LLM portability, multi-consumer reusability, faster long-tail capability addition — without the governance complexity of letting the agent compose queries.

## The trade-off this acknowledges

I lose the unbounded capability of "agent answers anything in the data." I'm still bounded to curated tools, just like today. But:

- Adding a curated tool to the MCP server is dramatically lighter than building a new bespoke action
- Other teams (or other agents) can consume the same MCP server, decoupled from one product
- Switching LLMs in the future doesn't require rewriting tool integrations
- Business logic (CRR aggregation, funnel-stage rules) lives in one place, governed and testable

For a high-stakes field user, **bounded reliability beats unbounded capability.**

## When I'd add generic SQL later

If clear demand emerges for ad-hoc data exploration, and after I've built the guardrails — query validation, cost limits, schema scope, row-level security — I'd add a `run_query` tool for power users. Stage 2.

But that's a maturity-stage decision, not a starting design.

## Three things this taught me

**1. Open protocol does not equal open autonomy.** MCP gives you the protocol benefits without forcing you to give the agent a SQL keyboard. You can have one without the other.

**2. Match the integration pattern to the workload.** Bespoke for ML inference and tight loops. MCP for structured data and growing surface areas. Don't migrate ideologically.

**3. Encode discipline in the tool layer.** Business logic — aggregation rules, edge cases, post-processing — belongs inside curated tools, not in the agent's prompt. The MCP server becomes the source of truth for "what does CRR mean."

## The framing I'm taking forward

When I think about agent architecture now, the question isn't "is this RAG, or agentic, or tool-use?" It's:

- Which capabilities are *bounded and high-frequency*? → Curated tools, latency-optimized.
- Which capabilities are *growing surface areas*? → MCP-mediated, schema-aware.
- Which capabilities are *long-tail and exploratory*? → Generic query, with guardrails, for trusted users only.

A mature agent system isn't one architecture. It's three, layered, each chosen because the workload earns it.

That's what I'd build today.

---

*Part of an ongoing series on building enterprise AI systems. Previous: [eval as system design](./eval-as-system-design.md). Next: where the action dial sits — when to let the system act vs. keep humans in the loop.*

*If you're working on enterprise agent architecture and wrestling with the same trade-offs, or you've made different calls and want to compare notes, I'd love to hear about it.*
