# The RM's Week

An interactive visual story for **AI for Relationship Managers**, a two-day BIBF programme for private banking relationship managers.

Participants follow Sara, a private banker in Riyadh, through one week with an AI assistant: nine acts, about thirty interactions, a 15-question knowledge check and a personal results card.

| Day | Act | What participants do |
|---|---|---|
| 1 | 1 · Fit | Estimate the week, sort ten tasks, break-even calculator |
| 1 | 2 · Brief | Four-part prompt builder, write-your-own brief with live feedback, choose-your-path correction, register matching |
| 1 | 3 · Trust | Pattern-completion demo, fluency-trap confidence test, "are you sure?" chat, 90-second error hunt |
| 1 | 4 · Documents | Four moves, "lost in the middle" explorer, workflow ordering |
| 1 | 5 · Voice | Spot the AI tells, three emails, Arabic terminology flip cards and translated-Arabic check |
| 1 | 6 · Safe | Identifiability funnel, redaction game, would-you-paste-this swipe cards, advice classifier |
| 2 | 7 · Choose | Five-dimension use-case scorer with payback, one-line promise builder |
| 2 | 8 · Build | Tool assembly, examples comparison, guardrail stress test |
| 2 | 9 · Adopt | Team time-saved calculator that writes the one-page case, keep/fix/kill |

All clients, figures and documents are **synthetic**. AI responses are **teaching simulations**, not live model output. Progress is stored only in the visitor's browser (`localStorage`).

## Run locally

It is a plain static site with no build step:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on Vercel

1. On vercel.com choose **Add New → Project** and import this repository.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Deploy. Every push to `main` redeploys automatically.

## Editing content

| What | Where |
|---|---|
| Act intros, insight panels, page copy | `index.html` |
| Interactions (data and feedback text) | `js/acts1to3.js`, `js/acts4to6.js`, `js/acts7to9.js` |
| Knowledge check and results card | `js/finale.js` |
| Synthetic Client A file | `js/data.js` |
| Styles and colours | `css/style.css` (tokens at the top) |
| Illustrations | `assets/art/*.svg` |

## Swapping in painted artwork

The illustrations are hand-coded SVGs. To replace them with generated or designed images, keep the same file names (or update the `src` in `index.html`). Suggested prompts for a consistent style:

> **Style prefix for every image:** "Warm editorial flat illustration, soft grain texture, cream background (#F7F3EA), deep navy (#1B2F63) and muted gold (#B8862B) palette with small accents of green and terracotta, gentle shadows, no text, wide 4:3 composition."

| File | Prompt (after the style prefix) |
|---|---|
| `hero.svg` | A Saudi woman private banker in a navy hijab and black abaya with gold trim, smiling at a laptop on a wooden desk, a gold dallah coffee pot and finjan cup beside her, floating document and chat-bubble cards, the Riyadh skyline with Kingdom Centre and Al Faisaliah towers in soft silhouette behind |
| `act1.svg` | A weekly calendar for Sunday to Thursday with coloured time blocks and a brass clock, conveying a busy week |
| `act2.svg` | A clipboard brief with four coloured tabs, a speech bubble with question marks, briefing a junior colleague |
| `act3.svg` | A magnifying glass over a printed report with one highlighted line in terracotta and a question mark |
| `act4.svg` | A tall stack of documents with a few highlighted lines distilled into a short navy note card |
| `act5.svg` | An envelope with a fountain pen, Latin and Arabic letters on the letter |
| `act6.svg` | A document with black redaction bars beside a navy shield with a gold check mark |
| `act7.svg` | A semicircular gauge from red to amber to green, needle pointing at green |
| `act8.svg` | Three stacked building blocks in navy, gold and green with a small wrench |
| `act9.svg` | A dotted path rising past three flags towards a horizon |
| `finale.svg` | A gold trophy with a star and two ribbons |

---

Built for BIBF. Not affiliated with or endorsed by any bank.
