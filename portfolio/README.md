# ai-portfolio

Workspace for exploring, building, and productionizing AI/ML projects, paired with a public learn-and-share post series. The portfolio is the projects + the writing — both are the artifact.

## Structure

- `projects/` — individual projects (one per subdirectory, with code, BRIEF, and posts)
- `notes/` — cross-project learnings, essays, and architectural thinking
- `experiments/` — quick spikes and prototypes that may or may not graduate to a project

## Capabilities being developed

- Model training & fine-tuning
- AI Evaluation
- AI / Agent orchestration
- Training data pipelines
- RAG (retrieval-augmented generation)
- MCP (Model Context Protocol) tooling
- Multi-agent systems
- Productionization & scaling

## Series — Building Enterprise AI Systems

Public posts on building and shipping enterprise agentic AI. Each post stands alone but together they form an ongoing argument for how senior PMs should think about AI systems.

| # | Post | Topic |
|---|---|---|
| 1 | [Eval as System Design](notes/eval-as-system-design.md) | Why eval is a system you design, not a step you do. Parallel human + LLM-as-judge grading, matching eval method to question type, the four pre-launch dimensions. |
| 2 | [Locked MCP: Open Protocol, Bounded Autonomy](notes/locked-mcp-agent-architecture.md) | Why agents should have an open protocol but not free-form SQL. What migrates to MCP, what stays bespoke, where curated tools earn their keep. |
| 3 | The Action Dial *(coming soon)* | When to let the system act vs. keep humans in the loop. Stakes, reversibility, and trust earned as the dial inputs. |

## Projects

| Project | Status | Theme |
|---|---|---|
| [lead-triage-eval-harness](projects/lead-triage-eval-harness/) | In progress (Week 1) | 3-stage GTM agent graded with three eval methods, surfacing per-slice quality regressions across model versions |
