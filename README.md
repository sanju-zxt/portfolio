# Portfolio — sanju-zxt.github.io/portfolio

Personal portfolio for **Lohith Sanju P** — full-stack developer, AI/data engineer, and AWS Student Builder Group Leader at VVIT Bengaluru.

**Live site:** https://sanju-zxt.github.io/portfolio

## What's on the page

| Section | Contents |
|---------|----------|
| **Home** | Name, typewriter role line, CTAs, portrait panel, live terminal block |
| **About** | Background, AWS Student Builder Group Leader callout, `profile.json` panel, stats |
| **Experience** | Timeline — AWS Student Builder Group Leader (Amazon Web Services, volunteer, Nov 2026 – present) and Full Stack Development Intern (Skyforger Technologies, Feb – Apr 2026) |
| **Skills** | Eight cards: frontend, app, backend, AI & data, MLOps, quantum, cloud & community, security & tools |
| **Projects** | 13 projects with filter tabs, metrics and live/code links |
| **Certifications** | 20 certificates; click any card to preview and download the PDF |
| **Blog** | Three articles that open in an in-page reader modal |
| **Contact** | Email, GitHub, LinkedIn, CTA band |

## Stack

Plain **HTML, CSS and vanilla JavaScript** — no framework, no bundler, no build step, no runtime dependency beyond Google Fonts and Font Awesome.

The look is a dark telemetry/terminal system:

- **Palette** — `#050507` base, crimson `#ff3333`, cyan `#00ffff`, muted slate hairlines. All tokens live in `:root` at the top of `site.css`.
- **Type** — Inter for prose, JetBrains Mono for tags, metrics, labels and terminal text.
- **Particle field** — a full-screen `<canvas>` running a custom boids-style loop: triangular glyphs flock, orbit the cursor, scatter on fast pointer movement and regroup. Capped particle count, DPR ≤ 2, paused when the tab is hidden, and replaced by a single static frame under `prefers-reduced-motion`.
- **Reveals** — rAF-throttled scroll check (not `IntersectionObserver`, so nothing can get stuck hidden) adds `.is-in` with a per-sibling stagger.
- **Telemetry HUD** — fixed bottom-centre bar showing measured FPS, `performance.memory` heap, real HEAD-request round-trip ping (`site.css?ping=<ts>`), `navigator.connection.effectiveType` and an Asia/Kolkata clock.
- **Micro-interactions** — cursor-relative radial glow on cards (`--mx`/`--my` custom properties), custom cursor dot + ring, scroll progress bar, syntax-coloured terminal with status badges.

## Files

| Path | Purpose |
|------|---------|
| `index.html` | The live site — markup + JSON-LD, links `site.css` and `site.js` |
| `site.css` | All styling: tokens, layout, components, responsive rules down to 390 px |
| `site.js` | Canvas physics, cursor, nav + active link, reveals, counters, typewriter, HUD, filters, modals, article data |
| `assets/` | Cropped profile images (`profile-portrait`, `-square`, `-wide`, jpg + webp) and `resume.pdf` |
| `certificates/` | 21 certificate PDFs, served to the certificate modal |
| `certifications.html` | Standalone certificate grid page (older, self-contained) |
| `dashboard.html`, `auth.js` | Older private dashboard prototype; not linked from the public site |
| `style.css`, `script.js` | Earlier theme and behaviours, **still loaded by `dashboard.html`** — do not delete |

## Local preview

```bash
python -m http.server 8000   # then open http://localhost:8000
```

Opening `index.html` directly from disk mostly works, but browsers restrict PDF embedding and the ping probe on `file://` — use the server for an accurate preview.

## Deploy

GitHub Pages serves the `main` branch root. There is no Actions workflow and no build step — **push to `main` and the site rebuilds in roughly 15 seconds.**

## Editing notes

- Colours and spacing are `:root` custom properties at the top of `site.css`.
- Any element with `.reveal` fades up on scroll automatically; siblings stagger by their index.
- Nav links are plain anchors (`#about`, `#work`, …); the active state is driven by an `IntersectionObserver` over `main section[id]`, so adding a section needs no extra JS.
- Project filter counts are derived from the `data-tags` attributes in `site.js`, so adding a card keeps the tab numbers honest.
- To add a certificate: drop the PDF into `certificates/` and add a `.cert` button whose `data-cert` is `title|category|issuer|year|file.pdf` (URL-encode spaces).
- Article bodies live in the `articles` array in `site.js`.
- `assets/resume.pdf` is a generated copy — rebuild it from `Documents/` rather than editing it here.
