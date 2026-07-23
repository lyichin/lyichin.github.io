---
title: "MCP Behind the Scenes: What We're Actually Clicking Yes to"
date: 2026-07-23
excerpt: "Most of us click through the MCP setup without reading it. There's no time. But each step we skip is doing a job, and read slowly they show a design that lets an AI do far more for us while keeping it in check."
---

> Most of us click through the MCP setup without reading it. A box asks to trust a server, we click Yes, a browser might open, we log in, and we get back to work. There's rarely time to stop. But each step is doing a specific job, and read slowly they turn into a clear picture of how an AI gets real reach without slipping our control.

The idea behind the Model Context Protocol: a server gives an AI some tools, and the AI uses them when it needs to. A server is really just a bundle of tools living at one address, so everything we set up is done to the server, and the tools come along inside it. On its own an AI can only talk. Plug in a server and it can act, and there's no limit to how many it can plug in. That's the point: MCP is how an AI reaches past its own walls and picks up whatever it needs to get more done for us.

## Isn't that just an API?

It's the first thing most people ask, and it's fair, because a server sitting at a URL sounds exactly like one.

The difference is who does the work. An API just links two sides; a person still has to do the connecting. To let an app show a map, a developer reads Google Maps' docs, learns its exact rules, and writes code for that one service. Want weather too? Read another set of docs, write more code. The human wires up every connection by hand.

MCP flips that. The server comes with a description of its tools, what each one can do and how to call it, and the AI reads that on the spot and works out the rest. Nobody wires anything up. The AI adds the server to its notebook and starts using it.

That last part is the whole difference, and it's why "MCP is just an API with some secrets bolted on" misses it. The new thing isn't the login. It's that the server explains its tools in a way the AI can read, so the AI can reach for them on its own instead of waiting for a human to connect the wires.

## The setup is where it gets murky

Simple as that idea is, the setup around it feels anything but. There's a file to edit, then another. A box appears asking to trust something. Sometimes a browser window opens and asks for a login. In the moment, none of it feels meaningful. It feels like steps between us and the thing we actually wanted to do, so most of us click through and move on.

That's a fair way to spend a busy afternoon. It also means the design slips right past us. Because the steps aren't busywork. Each one is a small, deliberate answer to a real question: does this server exist, am I allowed to use it, and how does the server know who's calling. Read in order, they show how MCP is meant to be trusted.

## We say what we want, and it gets done for us

All that reaching for tools happens without us ever touching one. We say what we want done, and the rest is handled for us. The files make this look more tangled than it is, so start with the shape. A person only ever talks to a *client*, the app in front of them like Claude Code. The client holds the AI, and it talks to the tools on our behalf.

<figure class="mcp-fig">
  <div class="mcp-flow">
    <div class="mcp-node">
      <div class="role">Human</div>
      <h4>You</h4>
      <p>Ask a plain-English question. Never call the server directly.</p>
    </div>
    <div class="mcp-arrow">⟷</div>
    <div class="mcp-node is-client">
      <div class="role">Client</div>
      <h4>e.g. Claude Code</h4>
      <p>Holds the AI. Picks the right tool, calls it, shows the result.</p>
    </div>
    <div class="mcp-arrow">⟷</div>
    <div class="mcp-node is-server">
      <div class="role">Server</div>
      <h4>my-mcp-server</h4>
      <p>Answers tool calls. Holds the logic and data. Sits at a URL.</p>
    </div>
  </div>
  <figcaption>The human never touches the server. The client is the only thing that does.</figcaption>
</figure>

The server is just a program at a URL (or a local binary) that answers tool calls and sits idle until something connects to it.

Here's the part that makes the files less confusing: editing them never touches the server. Each one is just a note in Claude's notebook, telling it which servers exist and which ones it's allowed to use.

## Adding a server is two steps

So the first thing we do is let Claude know this server exists. That takes two small steps, and they answer different questions.

<figure class="mcp-fig">
  <div class="mcp-steps">
    <div class="mcp-step">
      <div class="num">1</div>
      <h4>Register: write it down</h4>
      <p>Add the server's name and URL to <code>.mcp.json</code>. This is the note in Claude's notebook. Without it, Claude has never heard of the server.</p>
    </div>
    <div class="mcp-step">
      <div class="num">2</div>
      <h4>Approve: Claude asks if we trust it</h4>
      <p>Before using it, Claude comes back and asks whether we trust this server. We click <b>Yes</b>. Only then will it connect.</p>
    </div>
  </div>
  <figcaption>Step one tells Claude the server exists. Step two is Claude asking permission to use it.</figcaption>
</figure>

Writing it down is one command:

<figure class="mcp-fig">
  <div class="mcp-term">
    <span class="prompt">$</span> claude mcp add --transport http --scope project my-mcp-server https://my-mcp-server.example.com/mcp
  </div>
  <figcaption><code>--transport http</code> says it's a remote server; <code>--scope project</code> says write it into the shared <code>.mcp.json</code>. (Leave the scope off and it lands in a private <code>~/.claude.json</code> instead.)</figcaption>
</figure>

All it does is add a few lines to a file. Nothing has connected yet:

```json
// .mcp.json — the note, in a project folder
{
  "mcpServers": {
    "my-mcp-server": {
      "type": "streamable-http",   // remote server, reached over the web
      "url": "https://my-mcp-server.example.com/mcp"
    }
  }
}
```

Then, the next time Claude starts in that folder, it sees the new note and stops to ask:

<figure class="mcp-fig">
  <div class="mcp-prompt">
    <div class="p-title">New MCP server found in .mcp.json</div>
    <div class="p-line">my-mcp-server → https://my-mcp-server.example.com/mcp</div>
    <div class="p-line">Trust this server and allow the client to connect?</div>
    <div class="p-btns">
      <span class="btn yes">Yes</span>
      <span class="btn no">No</span>
    </div>
  </div>
  <figcaption>The box everyone clicks through. It's asking one real question.</figcaption>
</figure>

## What the Yes is for

A note in the notebook doesn't mean anyone agreed to it. That's why Claude asks.

The entry could have come from a project someone else set up, since these files get shared and copied between people. So before acting on an address it didn't write itself, Claude checks with a human: is this one we trust? Clicking Yes answers that, and nothing more. It confirms where the note came from. It doesn't hand over files.

That's also why the rules feel picky. Claude asks again in a new folder or on a new machine, and it skips the question entirely for servers we added ourselves, because a note we wrote needs no second opinion. The prompt only shows up for notes that came from somewhere else, which is exactly when a second opinion is worth having.

## The server's side: three ways it knows who's calling

Clicking Yes is Claude agreeing to *call* the server. The server still gets its own turn. When Claude connects, the server decides whether to answer. It does that in one of three ways.

<figure class="mcp-fig">
  <div class="mcp-trust">
    <div class="mcp-trust-row a">
      <div class="badge">A</div>
      <div>
        <h4>Already inside (VPN)</h4>
        <span class="who no">✗ Doesn't know who it is.</span>
        <p>Being on the company VPN is enough to reach the server, so it answers. It never asks who's calling. Like a door that's open because we're already in the building. Simple to set up, but no identity and no record of who did what.</p>
      </div>
    </div>
    <div class="mcp-trust-row b">
      <div class="badge">B</div>
      <div>
        <h4>Carry a key</h4>
        <span class="who yes">✓ Knows who it is.</span>
        <p>We pick up a key from the server first (like a GitHub access token), then hand it to Claude to carry. Every call shows the key, and the server reads it as us. The key is made by hand, so guarding and replacing it is a manual job.</p>
      </div>
    </div>
    <div class="mcp-trust-row c">
      <div class="badge">C</div>
      <div>
        <h4>Log in at the door</h4>
        <span class="who yes">✓ Knows who it is.</span>
        <p>The first time, a browser opens and we log in with our real account. The server hands a pass back to Claude, which keeps it and renews it. No key is ever seen or pasted. This is how Slack, Google Drive, and claude.ai Connectors get set up.</p>
      </div>
    </div>
  </div>
  <figcaption>B and C both prove who's calling. In B we carry a key we picked up; in C a login hands one over for us. A proves nothing. It just trusts the network.</figcaption>
</figure>

One honest note, since this is a mental model and not the spec: these three are how it plays out in practice, not a list the protocol spells out. The official rules only describe model C in full, the "log in with your account" flow behind every "Sign in with Google" button. And they don't require a server to check who's calling at all, which is what leaves room for model A to ask nothing. Network trust and pasted keys are things the spec allows, not names it uses.

## The three feel the same, until more than one person is involved

On one laptop, all three look interchangeable. The difference shows up the moment a team or a company is involved, because now the first question isn't what the server can do. It's who's asking, and whether that can be shown later.

Model A can't answer it. It knows a call came through the VPN, but not who made it, so there's no record of who did what. Model B can, because a key is an identity, but it's a key made by hand that no one can cancel centrally or trace back to a real account when a person leaves. Model C is the one that holds up: the login ties every call to a real account, managed and logged like everything else in the company.

Which is why the browser popping open, the step that feels like the most friction, is the one that makes MCP safe enough to trust with real data.

## So is it well designed? Mostly, with soft spots

Read end to end, the steps do fit together. Register, approve, and the login each answer a real question, and the questions stack in a sensible order. It's a thoughtful design.

It also leans on two things harder than it looks.

The whole safety of the approval rests on a human actually reading the box. The honest problem is the one this piece opened with: we don't. A guard that only works when we slow down is weakest at the exact moment we're busy, which is most of them.

And we say Yes only once. We vouch for a server today; it can quietly change what its tools do tomorrow, and the old Yes still stands. Trust is granted in a moment, but the server keeps moving after it.

Neither sinks it. They're the fault lines to watch as MCP spreads, and the reason the trust model matters more than it first looks: the stronger the identity behind a server, the less either soft spot can hide.

## Worth reading once, slowly

For a busy person, clicking through is a fair trade. It saves time and lets us do things that weren't possible before. But a minute spent on each step shows something quieter underneath: the steps aren't in the way. They're a careful design that lets us do what we want and protects us while we do it.

Register asks whether the server exists. Approve is where a human vouches for an address that may have come from someone else. The login is how the server learns who's really calling. Each is a small answer to a real question, and together they're what lets an AI reach for the world without getting loose in it.
