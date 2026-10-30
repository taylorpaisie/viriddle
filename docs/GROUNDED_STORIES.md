# Grounded outbreak stories

Prepared narrative refresh; production practice upload awaits explicit approval. Automatic approval review rejected the attempted production upsert before execution. No practice records changed.

The comedy comes from plausible human behavior: competing event plans, overconfident announcements, badge-printing failures, overwritten drafts, excessively long talks and defensive paperwork. All pathogens and patients remain fictional. No plush microbes, duck spokespeople, talking viruses, lunar transmission claims or machine witnesses remain in rendered fixtures.

## Three introductory cases

Stable internal slugs keep practice links working. Each case still has three patients, the same onset dates, contact dates, distinct intended source index and two-edge simulated chain. Each has a fictional 1–4 day incubation and symptom-onset infectiousness rule. These are teaching assumptions, not claims about a real pathogen.

| Stable slug | New title | Story |
| --- | --- | --- |
| `duck-press` | The Emergency Press Briefing | Darren has drafted answers before the team has agreed on the evidence. A missing attachment and contradictory slides derail the announcement. |
| `stapler-wedding` | The Conference Welcome-Pack Crisis | Four hundred badges show Darren’s name. Three organizers have a fictional respiratory bacterial illness; the relevant evidence is their dated human contacts. |
| `moon-lawsuit` | The Forty-Seven-Slide Apology | A virology demonstration fails. Darren’s apology requires a projector and an intermission while three volunteers report a fictional respiratory viral illness. |

Nine respiratory full cases receive richer briefings. The hospital case retains its evidence-based, individual-source-unresolved conclusion and its anti-scapegoating framing; Darren’s sinister communications draft is background, never evidence of guilt. Darren appears in every example, with human-scale comic asides clearly labeled as non-evidence. No epidemiological dates, contact indices, SNP distances or official solutions change.

## Delivery and validation

- `caseCopy.ts` changes only known legacy public briefing text, allowing already scheduled daily snapshots to show the improved setup without rewriting official records.
- `darrenStory.ts` removes the exact older comic additions and appends one current setup/aside. It is idempotent, applies interview changes only to unlocked transcripts and cannot reveal evidence.
- Curated practice records must be regenerated with `node --experimental-strip-types scripts/generate-practice-sql.ts`. This contains solutions: run privately, never commit its output or include it in public assets.
- Apply the generated **13 practice-only upserts** after explicit production approval, then merge the source refresh. Do not rerun migrations, reseed `daily_cases`, alter `case_secrets` or modify player attempts.
- Local case tests cover valid transmission timing, rotating names, roster uniqueness, reading length, legacy-flavor replacement, absence of toy-based narratives and unchanged contact/genomic data. Isolated PostgreSQL tests load all revised fixtures and enforce practice/competitive separation. Production upload remains unapplied.
