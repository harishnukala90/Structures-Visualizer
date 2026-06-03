<div align="center">

<img src="public/logo.png" alt="Structures Visualizer" width="140" />

# Structures Visualizer

### Interactive Learning & Visualization Playground

**An animated, hands-on playground to master data structures and algorithms.**
Pick a structure, trigger an operation, and watch every step unfold with live code, complexity metrics, and step-by-step controls.

🌐 **[structures-visualizer.netlify.app](https://structures-visualizer.netlify.app)**

<img src="public/qrcode.png" alt="Scan to open on mobile" width="160" />

*Scan the QR code to open on your mobile device*

</div>

---

## What is this?

Structures Visualizer covers **19 data structures and algorithms** spanning primitives, linear structures, trees, graphs, hash-based collections, searching, and sorting — all animated interactively inside your browser with zero setup.

Every structure comes with:
- ▶️ **Playback controls** — Play, Pause, Step Forward, Step Backward, Speed slider
- 🗂️ **Multilingual code snippets** — C, C++, Java, Python with syntax coloring
- 📊 **Complexity HUD** — per-operation time and space complexity displayed at a glance
- 📝 **Live step descriptions** — plain-English explanation of what each animation frame means

---

## Supported Structures

| Category | What's inside |
|---|---|
| Primitives | Integer · Float · Character · Boolean · Pointer |
| Linear | 1D Array · 2D Array · Singly LL · Doubly LL · Circular LL · Doubly Circular LL · Stack · Queue · Circular Queue · Deque |
| Non-Linear | Binary Search Tree · AVL Tree · Graph (BFS & DFS) |
| Hash-Based | Hash Table · Hash Set |
| Searching | Linear Search · Binary Search |
| Sorting | Bubble · Selection · Insertion · Merge · Quick |

---

## Getting Started

Make sure [Node.js LTS](https://nodejs.org/) is installed, then:

```bash
# 1. Clone the repo
git clone https://github.com/harishnukala90/Structures-Visualizer.git
cd Structure-Visualizer

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [`http://localhost:5173`](http://localhost:5173) in your browser.

### Available commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## Tech Used

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Localization | i18next · react-i18next |

---

## Folder Layout

```
Structure-Visualizer/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── public/
│   ├── logo.png
│   └── qrcode.png
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── dataStructures.js      ← config: states, complexities, code snippets
    ├── animationEngine.js     ← step generation for all 19 structures
    ├── i18n.js                ← internationalization setup
    └── components/
        └── Visualizer.jsx     ← canvas renderer for all structure types
```

---

## How Netlify Deployment Works

This repo uses **GitHub → Netlify** continuous deployment. Every push to `main` triggers an automatic rebuild.

**Netlify build config:**

```
Build command:   npm run build
Publish dir:     dist
Branch:          main
```

To connect a fresh Netlify site: go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git** → select this repository → apply the settings above → **Deploy**.

---

## Things Worth Knowing

- No backend. All state lives in React — animations, history, and theme preference are fully client-side.
- `animationEngine.js` drives every animation: it takes a structure id, an operation, and the current state, then returns a timeline of steps.
- `dataStructures.js` is the single source of truth for default states, complexity tables, pros/cons, and code snippets.
- The UI is fully responsive — a collapsible sidebar replaces the desktop panel on small screens.
