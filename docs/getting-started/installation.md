# Installation

## Prerequisites

- **Node 18.17.x.** The project is pinned to this line (see the note below).
- **npm** (ships with Node).
- **Git**, to clone the repository.

!!! info "Why Node 18.17?"
    The app is pinned to **Next.js 14** because Next 15/16 require **Node ≥ 18.18**.
    Do not bump Next past 14.2.x unless Node is upgraded first.

## Clone and install

```bash
git clone https://github.com/mubin986/claude-code-ostad.git
cd claude-code-ostad
npm install
```

## Available scripts

| Command         | What it does                                             |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Start the dev server at <http://localhost:3000>.        |
| `npm run build` | Production build. Run before pushing to catch type errors. |
| `npm run start` | Serve the production build.                             |
| `npm run lint`  | Run `next lint`.                                        |

## Verify

```bash
npm run dev
```

Open <http://localhost:3000> — you should see the todo app with a floating
**Feedback** button in the corner.

Next: [Quickstart](quickstart.md).
