# Hansraj Deghun — Portfolio

A static, recruiter-first portfolio focused on backend engineering, distributed systems, and agentic commerce.

## Public pages

- `index.html` — portfolio, experience, impact, selected projects, writing, and contact
- `blogs.html` — searchable and filterable engineering-writing archive
- `article.html?slug=…` — dedicated frontend article reader
- `ephemeralchat.html` — EphemeralChat case study and live demo
- `shorturl.html` — ShortURL case study, live demo, and analytics
- `calendar.html` — standalone scheduling utility

## Architecture

The portfolio itself is fully static. Article metadata and sanitized bodies live in `blog-data.js`; there is no portfolio API or MongoDB dependency. The two project pages connect only to their respective external demo services:

- `https://ephemeralchat.hansraj.me`
- `https://shorturl.hansraj.me`

Shared presentation is split by surface:

- `terminal.css` / `terminal.js` — homepage system and interactions
- `blog.css` / `blog.js` — archive and article reader
- `project.css` / `project.js` — project case studies and service status
- `styles.css` — retained legacy demo primitives and calendar styles

## Local preview

Serve the directory with any static web server. For example:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/`.

## Content updates

- Update homepage copy in `index.html`.
- Update articles in `blog-data.js`.
- Keep article slugs aligned with `sitemap.xml` and homepage writing links.
- Preserve existing demo element IDs and external API endpoints when editing project pages.

## Deployment

The repository can be deployed directly to Vercel, GitHub Pages, or another static host. `robots.txt`, `sitemap.xml`, and `vercel.json` contain the existing domain and routing configuration.
