---
title: "Locked MCP: Open Protocol, Not Free-Form SQL"
date: 2026-05-29
excerpt: "I sketched the architecture three times before I caught the trap. The version I landed on exposes MCP, but never lets the agent write SQL. Here's why."
---

> Every architecture decision sits between two pressures. With MCP, the one I underweighted at first was the difference between open protocol and open autonomy. They're orthogonal. Taking the protocol benefits doesn't require handing the agent a SQL keyboard.

I sketched the MCP architecture three times before I caught the trap.

The agent I work on is a Product GTM Agent embedded in seller Slack. AEs and CSMs ask things like *who should I sell to next quarter,* *what changed in this customer's usage,* *what's the run rate on this contract.* The agent reasons over product-usage signals and chains capabilities: knowledge retrieval, customer-data lookup, ML lookalike comparison, rule-based playbook recommendations, deal-sizing calculations. It's not a chatbot. It's an orchestrator that picks the right tool, calls it, composes the answer.

Today, every tool is a bespoke integration. SageMaker for ML inference. Custom database wrappers for structured lookups. Vector DB calls for RAG. The integrations are fast and stable. Adding a new one is an engineering project, and every new one deepens our coupling to a single stack.

So I sat down to plan the migration to MCP.

## First sketch: MCP for everything

The first sketch was the obvious one. Wrap every tool in MCP. Expose them through the same protocol. The agent gets discoverability, the platform gets portability, switching LLMs becomes a config change.

Then I started costing it.

The SageMaker lookalike model is already the latency bottleneck. Wrapping it in MCP adds a protocol hop and serialization overhead for zero new capability. The deal-sizing calculator has its own auth and state — MCP wrapping it doesn't unlock anything, just adds a layer. The hot-path actions that don't change much (return customer ID, return contract status) would cost more to migrate than they earn back.

The "MCP for everything" version assumed the protocol was free. It isn't.

## Second sketch: nothing changes

The second sketch went the other way. Keep all the bespoke integrations. Don't migrate.

That collapsed almost immediately when I looked at the queue. Every new metric the agent needs is a hand-written SQL inside a custom action. Customer journey funnel data, consumption breakdowns, knowledge search across docs — each one is an engineering ticket. The team's velocity is bounded by how fast we can stamp out new actions. The agent can answer only what we anticipated; everything else is a feature request.

The "nothing changes" version meant capping the agent's intelligence at our roadmap pace. Which means capping it well below what the data could actually answer.

## Third sketch: Snowflake MCP, full schema, free SQL

The third sketch felt like the unlock. Stand up a Snowflake MCP server, expose the schema, let the agent compose queries on the fly. The agent can now answer anything the data can answer. Adding a new metric stops being an engineering ticket.

I started writing the design doc.

Then I started writing the failure modes.

Our users are quota-carrying sellers. A wrong number kills trust permanently — not for that query, for the whole product. Our consumption metrics have aggregation rules that aren't obvious from the schema: dedup logic across multi-contract accounts, schedule-elapsed checks for run-rate volatility, exclusions for trial usage, attribution rules for upsell credit. None of that lives in column names. It lives in the SQL we hand-wrote into the existing bespoke actions.

A free-form SQL agent doesn't know those rules. You can put them in the prompt, but you can't guarantee the agent applies them every time. And "every time" is the bar when one wrong number kills the product.

The third sketch had to be wrong, even though it was the most exciting.

## The version I landed on

The compromise that emerged: keep MCP, but expose only curated tools through it. No free-form SQL.

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

The agent picks the right tool based on the user's question and passes parameters. It never writes SQL. The business logic lives inside the tool implementation, governed and testable, in one place.

The protocol benefits stay: open standard, multi-LLM portability, multi-consumer reusability, faster long-tail capability addition. Adding a new curated tool to the MCP server is dramatically lighter than building a new bespoke action — it's a function signature, a SQL block, and a docstring, not a new integration. Other teams can consume the same server. Switching LLMs doesn't require rewriting integrations.

What I gave up: the unbounded "agent answers anything in the data" capability. I'm still bounded to what I've curated, just like before MCP. The bound is the same. What changed is how much the bound costs to move.

## Where the boundary actually sits

The clearer way to see the architecture, after the three sketches:

- **Bespoke, native integration:** ML inference, tight external app loops, hot-path actions with stable surface area. Anywhere protocol overhead costs more than it earns.
- **MCP with curated tools:** structured data lookups, knowledge retrieval, anything that's "query a warehouse and return fields" but has business logic that can't be schema-encoded.
- **MCP with generic query (someday):** ad-hoc data exploration, but only after query validation, cost limits, schema scope, and row-level security exist. Stage 2, for trusted users, not the seller agent.

Three integration patterns. One agent. The pattern is chosen by the workload, not by the protocol fashion.

## What this changed in how I think

The first thing was where business logic lives. Before, business logic lived inside the agent's prompt or scattered across custom action implementations. After, it lives inside the MCP server's tool definitions — single source of truth for what CRR means, what "stuck in funnel" means, how dedup works. The agent doesn't carry the rules. The tool layer does.

The second was the difference between an open protocol and open autonomy. They're orthogonal. MCP gives you the protocol benefits whether or not you give the agent a SQL keyboard. Choosing not to expose `run_query` doesn't cost you any MCP value. It just means the agent acts through doors you've checked, not doors you haven't.

The third was that the most exciting design isn't always the right starting point. Free-form SQL on Snowflake felt like the unlock the first time I saw it. It was. For internal data analysts. Not for an agent serving sellers whose trust budget is one wrong number.

