# Deployment

This page covers deploying **the app** and **this documentation site**.

## Documentation site (GitHub Pages)

The docs are a [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
site. The toolchain only needs Python — it's independent of the app's stack.

### Build locally

```bash
python -m pip install -r docs/requirements.txt
mkdocs serve      # live preview at http://127.0.0.1:8000
mkdocs build      # static output in ./site
```

### Automated deploy

[`.github/workflows/docs.yml`](https://github.com/mubin986/claude-code-ostad/blob/main/.github/workflows/docs.yml)
builds and deploys to **GitHub Pages** on pushes to `main` that touch `docs/**`
or `mkdocs.yml`.

!!! note "One-time Pages setup"
    In the repository settings, set **Settings → Pages → Build and deployment →
    Source** to **GitHub Actions**. The published site will be at
    <https://mubin986.github.io/claude-code-ostad/>.

## The app

The app builds to a standard Next.js production bundle:

```bash
npm run build
npm run start
```

### :material-alert: Before deploying for real testers

The tester build has two limitations that matter in production:

!!! danger "Feedback storage is a local JSON file"
    Feedback is written to `data/feedback.json`. On ephemeral/serverless hosts
    (e.g. Vercel) the filesystem is **not persistent**, so submissions are lost.
    Move to a real datastore before collecting feedback remotely.

!!! danger "`/feedback` has no authentication"
    Anyone who can reach the app can read every submission. Add an auth gate
    before exposing `/feedback` publicly.

### Runtime constraint

The feedback API requires the **Node.js runtime** (it writes to the filesystem),
so a fully static export won't work for that route. Host on a platform that runs
the Next.js Node server.
