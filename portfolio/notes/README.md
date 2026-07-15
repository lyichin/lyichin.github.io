# notes

Cross-project essays and architectural thinking. Each note stands alone; together they form the public series *Building Enterprise AI Systems*.

## Series posts

| # | Post | One-line summary |
|---|---|---|
| 1 | [Eval as System Design](eval-as-system-design.md) | Eval is a system you design, not a step you do. Parallel human + LLM-as-judge grading as calibration, matching eval method to question type, four pre-launch dimensions that catch real failure modes. |
| 2 | [Locked MCP: Open Protocol, Bounded Autonomy](locked-mcp-agent-architecture.md) | Agents should have an open protocol but not free-form SQL. What migrates to MCP, what stays bespoke, why curated tools beat unbounded query autonomy for high-stakes users. |

## Coming soon

- *The Action Dial* — when to let the system act vs. keep humans in the loop
- *Retrieval is the lever, not the model* — most failure was upstream of generation

## How these notes get written

These are not after-action reports. They are the thinking I do as I work through real architecture and product decisions on enterprise agentic AI. Each post is anchored on a real product (a Product GTM Agent embedded in seller Slack) and the trade-offs that came up while building it.

Voice: first-person, concrete, no AI tone. No company names, no internal numbers. Generalizable without losing teeth.
