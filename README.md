# PhDays 2026 — Presentation

An infinitely-scrollable talk web app for **Nicola Fanelli**, PhDays 2026, University of Bari Aldo Moro.
Scholarship title: *"Analysis and valorization of digitized artistic heritage using Artificial Intelligence techniques."*

## Run it

Fully **offline** and self-contained. Two ways:

- **Simplest:** double-click `index.html` (opens via `file://` — everything works, including the
  Token-Activation-Map heatmaps).
- **Recommended for the talk:** serve locally, then open fullscreen (F11):
  ```bash
  cd /home/nico/PhD/phdays
  python3 -m http.server 8000
  # open http://localhost:8000
  ```

Navigate by scrolling. The dots on the right jump between sections; **↑ / ↓** (or PageUp/PageDown)
jump section-to-section.

## Structure

| Section | Content |
|---|---|
| Hero | Scholarship title |
| Background | Vision–language models for cultural heritage (the through-line) |
| Roadmap | The three works: Understand → Create → Interpret |
| **ArtSeek** | Pipeline + **interactive chat demo** + results (arXiv 2507.21917) |
| **I Dream My Painting** | **Clickable multi-mask inpainting stepper** (WACV 2025) |
| Zürich | 6-month visit with Dr. Eva Cetinic — latent-space interpretability |
| **Token Activation Maps** | **Interactive TAM explorer** with real data (ICPR 2026) |
| Closing | The arc, links, thanks |

## Interactive demos

- **ArtSeek chat** — click *Advance* to reveal each turn (artwork card → reasoning → tool call →
  retrieved document → Content/Form/Context answer).
- **IDMP stepper** — click the 5 steps, or *Auto-play*; *Show original animation* plays the project GIF.
- **TAM explorer** — pick a painting, click any colored caption token to see its heatmap; toggle
  TAM / Otsu / SAM-3 and opacity. Uses genuine activation maps from the TAMArt demo. *Luncheon on the
  Grass* is the standout: the model predicts the title **"Olympia"** (wrong) but the artist correctly.

## Editing content

All talk content lives in plain files — no build step:

- `js/content.js` — the **ArtSeek chat transcript** and the **IDMP steps/prompts**.
  → **Swap the ArtSeek chat** for your own recorded demo by editing `ARTSEEK_CHAT.steps`.
- `js/tam-data.js` — inlined TAMArt painting data (captions, activation maps, masks). Regenerate from
  more paintings if desired (source data at `nicolafan.github.io/tamart`).
- `index.html` — section copy. `css/styles.css` — the "light editorial ink" design system.

## Notes

- The current ArtSeek chat is a **real example from the paper (Fig. 6, "Girl with a Flute")** — replace
  it with your live-demo transcript when ready.
- Assets (arXiv/GitHub figures, the IDMP task GIF and extracted frames, TAMArt artworks + SAM masks)
  are downloaded locally under `assets/` so nothing depends on the network during the talk.
