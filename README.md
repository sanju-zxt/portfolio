# Portfolio — sanju-zxt.github.io/portfolio

Personal portfolio for **Lohith Sanju P** — full-stack developer and AWS Student Builder Group Leader.

**Live site:** https://sanju-zxt.github.io/portfolio

## What's on the page

| Section | Contents |
|---------|----------|
| **Home** | Name, role line, CTAs |
| **About** | Background, current focus, stats |
| **Experience** | Timeline of roles — AWS Student Builder Group Leader (Amazon Web Services, volunteer, Nov 2026 – present) and Full Stack Development Intern (Skyforger Technologies, Feb – Apr 2026) |
| **Skills** | Frontend, app, backend, AI & data, quantum computing, security, cloud & community, tools, soft skills |
| **Projects** | Featured projects with stack + live/code links |
| **Certifications** | 21 certificates; click any card to preview and download the PDF |
| **Blog** | Post cards that open in an in-page modal |
| **Contact** | Email, GitHub, LinkedIn, socials |

## Stack

Plain **HTML, CSS and vanilla JavaScript** — no framework, no bundler, no build step.

`index.html` is deliberately self-contained: markup, the whole theme in a `<style>` block, and one `<script>` block holding the page logic (blog data, particles, custom cursor, typewriter, rAF-throttled navbar/active-link + back-to-top handler, `IntersectionObserver` reveal-on-scroll, project-card tilt, gradient background, certificate + blog modals, Konami easter egg).

## Files

| Path | Purpose |
|------|---------|
| `index.html` | The live site — markup + all CSS + all JS |
| `certificates/` | 21 certificate PDFs, served to the certificate modal |
| `certifications.html` | Standalone certificate grid page (also self-contained) |
| `dashboard.html`, `auth.js` | Older private dashboard prototype; not linked from the public site |
| `style.css`, `script.js` | Earlier standalone versions of the theme and behaviours; **not loaded by `index.html`** |

## Local preview

```bash
python -m http.server 8000   # then open http://localhost:8000
```

Or just open `index.html` directly in a browser.

## Deploy

GitHub Pages serves the `main` branch root. There is no Actions workflow and no build step — **push to `main` and the site rebuilds in roughly 15 seconds.**

## Editing notes

- Colours and spacing live in the `:root` custom properties at the top of `index.html` (`--primary: #7c5cff`, dark `--bg`, etc.).
- Cards use the `.reveal` class; the `IntersectionObserver` in `index.html` adds `.active` on scroll, so any new `.reveal` element animates in automatically.
- Nav links are plain anchors (`#experience`, `#skills`, …) and the scroll handler highlights whichever `section[id]` is in view — adding a section needs no extra JS.
- To add a certificate: drop the PDF into `certificates/` and add a `.cert-card` calling `openCertModal(title, category, issuer, year, "file.pdf")`.
- Blog posts live in the `blogArticles` array in the inline script.
