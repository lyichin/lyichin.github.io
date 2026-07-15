# STAR Story: ASR Model Evaluation (Whisper vs. APIs)

**Competencies:** Technical Depth, Debugging, Measurement, PM Judgment.

## Context / Situation
As a Principal PM at Descript (proactive scenario), I faced a critical build-vs-buy decision: Should we transition from expensive 3P ASR APIs (e.g., Deepgram, OpenAI) to locally hosted Whisper variants (e.g., Whisper Turbo)? The decision would impact 60% of our COGS and the core editing experience for millions of users.

## My Responsibility / Task
I was responsible for architecting a rigorous, multi-dimensional evaluation framework to move past "WER vibe checks" and quantify the product-level trade-offs of model choices.

## Key Challenges
- **The "WER Lie":** Aggregate Word Error Rate (WER) was identical across models (~3%), yet users reported "hallucinations" and "proper noun errors" in one version.
- **Timestamp Drift:** High-end video editing requires <50ms timestamp accuracy; native Whisper models often drift >600ms on spontaneous speech.

## Actions I Took
- **Named Entity WER (NE-WER):** I pivoted the evaluation metric from generic WER to NE-WER, focusing specifically on technical jargon and proper nouns. This revealed a **15.4pp performance gap** that aggregate metrics hid.
- **Trajectory Analysis (The Glass Box):** I inspected the "Worst 5" samples from Whisper Turbo. I identified an autoregressive loop where the model repeated words indefinitely. I diagnosed the cause as a default parameter (`condition_on_previous_text=True`) and flipped it, dropping WER by 78% in affected samples.
- **Force-Alignment Post-Process:** I quantified the "Timestamp MATE" (Mean Absolute Timing Error). I determined that native Whisper was insufficient for "editor-grade" cuts and architected a requirement for a **wav2vec2/WhisperX** force-alignment layer.
- **Token Economics:** I proposed a **Dual-Model Router** strategy: routing routine summarization to a "Flash" model and reserving high-fidelity Whisper Turbo for the primary transcript, cutting projected COGS by 40%.

## Outcomes & Impact
- **Data-Driven Build Decision:** Recommended the move to Whisper Turbo + Force Alignment, saving $2M/year in API costs while improving transcription quality for podcast users.
- **Evaluation Engine:** Built a reusable "Bakeoff" harness that reduced the time to evaluate new model versions from weeks to 2 hours.

## Lessons Learned / Reflections
**Trajectory is the Truth.** Aggregate metrics like WER are "Black Box" signals. To build frontier AI products, you must use "Glass Box" evaluation to inspect the reasoning path and the "Named Entities" that actually matter to users.
