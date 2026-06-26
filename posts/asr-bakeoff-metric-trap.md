---
title: "ASR Bakeoff: The Experiment That Shaped the Architecture"
date: 2026-06-10
excerpt: "I ran three voice models on real business audio. The standard metric said they were tied. The one I built reversed the winner by 15 points."
---

In enterprise AI, voice is taking over surfaces that used to be text: meeting summaries, agent interactions, async briefings for people who won't read a dashboard. It's a different model stack, different UX, different way to measure quality. I didn't have intuition here yet, so I ran three voice models on real business audio — and found that the standard accuracy benchmark hides the errors that actually matter. I had to build my own metric to see which model was actually winning.

## The models

I picked three variants of OpenAI's Whisper, the most widely used open speech-to-text model. They all share the same "ear" (encoder) — the part that listens to audio. They differ in the "mouth" (decoder) — the part that turns what was heard into text.

| Model | Decoder | Parameters |
|---|---|---|
| large-v3 | 32 layers | 1.55B |
| turbo | 4 layers | 809M |
| distil-large-v3 | 2 layers | 756M |

All three hear identically. The difference is how much capacity they have to turn what they heard into accurate text. Turbo and distil cut that capacity dramatically to run faster. The question: does that trade-off cost you anything that matters?

I tested them on Earnings-22 — spontaneous financial speech with jargon, interruptions, and proper nouns. The closest public proxy to enterprise audio like meetings and podcasts.

## The metric that lied

Results on Word Error Rate:

| Model | WER | Speed |
|---|---|---|
| large-v3 | 10.6% | 0.334 RTF |
| turbo | 12.0% | 0.246 RTF |
| distil-large-v3 | 12.4% | 0.238 RTF |

A 1.8-point spread. Basically a tie, with smaller models running 30% faster.

But WER treats every word equally. "The" counts the same as "Anthropic." Common words dominate any text, and all three models nail those. The errors a user would actually notice — a wrong name, a wrong number, a wrong company — get buried in the average.

## The metric that told the truth

I built NE-WER: Word Error Rate restricted to named entities only. Proper nouns, numbers, company names, technical terms.

| Model | Named-Entity WER | Overall WER |
|---|---|---|
| turbo | 19.2% | 12.0% |
| large-v3 | 28.2% | 10.6% |
| distil-large-v3 | 34.6% | 12.4% |

The spread exploded to 15 points. The ranking flipped. Turbo, which *lost* on WER, *won* on the words that actually matter. The biggest model wasn't the best at the hard words. The trendy lightweight option was worst by a mile.

If a voice system gets a CEO's name wrong or misquotes a revenue number, trust is gone instantly. WER wouldn't have caught that. NE-WER did.

There's also a timing dimension. Voice models produce word-level timestamps — when each word was spoken. Whisper's timing drifts 500–700ms on average, over a second in the worst cases. That matters for anything interactive built on top, but it's a separate problem from transcription accuracy.

## Benchmarks don't transfer to real audio

One more finding:

| Audio condition | WER |
|---|---|
| Studio-recorded read speech | 3.2% |
| Spontaneous business speech | 10.6% |

Same model, 3x worse on messy real-world audio. "Whisper achieves human parity" holds in a quiet studio. It does not hold for meetings, podcasts, or anything with crosstalk, hesitation, or domain jargon.

Published benchmarks need heavy discounting when planning for production.

## How I'd build this

The experiment didn't give me a single winner. It gave me a shape.

**Local model (turbo) as the default.** Fast, cheap (~$0.05/hr vs. $0.26–0.65/hr for APIs), and best on named entities among the local options. At enterprise volume, the cost difference is massive.

**Paid API for the gaps local can't close.** Even the best local model gets 1 in 5 named entities wrong. For high-stakes surfaces — exec briefings, customer-facing summaries — that's not good enough. 3P services can fine-tune on domain vocabulary. I haven't validated this side yet, but I know exactly *where* to spend that money and *why*. The next experiment is scoped.

**Separate system for timestamps.** Whisper's word timing drifts 500–700ms on average, over a second in the worst cases. Good enough for "tap to jump." Not good enough for precise clipping or real-time sync. I'd bolt on a dedicated alignment tool rather than waiting for a transcription model to solve a problem it was never trained for.

Not everything needs the best model. Not everything can tolerate the cheap one. When I don't have intuition yet, I build the experiment. The architecture follows from what the numbers say.
