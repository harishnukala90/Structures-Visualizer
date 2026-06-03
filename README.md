# Structures Visualizer — Interactive Learning & Visualization Playground

<p align="center">
  <img src="public/logo.png" alt="Structures Visualizer logo" width="180" />
</p>

<p align="center">
  <strong>Visualize, learn, and experiment with 19 data structures and algorithms — step by step, in real time.</strong>
</p>

Structures Visualizer is a React + Vite application that transforms abstract data structures into animated, interactive playgrounds. It supports step-by-step traversals, live operation controls, multilingual code snippets (C, C++, Java, Python), and built-in complexity metrics — all inside a sleek dark-themed UI.

## Live Demo

<p align="center">
  <a href="https://structures-visualizer.netlify.app" target="_blank" rel="noopener noreferrer">
    <strong>🚀 Open Live Demo</strong>
  </a>
</p>

<p align="center">
  <img src="public/qrcode.png" alt="QR Code for Structures Visualizer" width="180" />
</p>

Production URL: `https://structures-visualizer.netlify.app`

## Highlights

- 19 interactive data structures and algorithms across 6 categories
- Step-by-step animation engine with Play, Pause, Step Forward, Step Backward, and Speed controls
- Multilingual code viewer — C, C++, Java, and Python with syntax highlighting
- Live complexity HUD — search, insert, delete, space, and time complexities per structure
- Category filter sidebar with responsive mobile toggle
- Internationalization (i18n) support via react-i18next
- Glassmorphism dark-mode UI with smooth micro-animations

## Stack

- React 19
- Vite 8
- Tailwind CSS 4
- `@vitejs/plugin-react`
- `lucide-react`
- `i18next`
- `react-i18next`

## Requirements

Install Node.js first. Use the current LTS version from:

```text
https://nodejs.org/
```

After installation, confirm both commands work:

```bash
node -v
npm -v
```

## Setup

Install dependencies:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Useful Scripts

```bash
npm run dev      # Start local development server with HMR
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint checks across the project
```

## Project Structure

```text
Structure-Visualizer/
  index.html
  vite.config.js
  eslint.config.js
  package.json
  public/
    logo.png
    qrcode.png
  src/
    App.jsx
    App.css
    main.jsx
    index.css
    dataStructures.js
    animationEngine.js
    i18n.js
    components/
      Visualizer.jsx
```

## Supported Structures & Categories

| Category | Structures / Algorithms |
| :--- | :--- |
| **Primitives** | Integer, Float, Character, Boolean, Pointer |
| **Linear** | 1D Array, 2D Array, Singly Linked List, Doubly Linked List, Circular Linked List, Doubly Circular Linked List, Stack, Queue, Circular Queue, Deque |
| **Non-Linear** | Binary Search Tree, AVL Tree, Graph (BFS / DFS) |
| **Hash-Based** | Hash Table, Hash Set |
| **Searching** | Linear Search, Binary Search |
| **Sorting** | Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort |

## Deployment on Netlify via GitHub

This repository is wired for automatic continuous deployment on Netlify.

### Build Settings

| Setting | Value |
| :--- | :--- |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Branch** | `main` |

### Steps

1. Log in to [app.netlify.com](https://app.netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and select the `Structures-Visualizer` repository.
4. Set the build command to `npm run build` and publish directory to `dist`.
5. Click **Deploy Site**.

Every push to `main` will trigger an automatic redeploy.

## Notes

- All animation state is managed locally in React — no backend or database required.
- Prompt history and theme preferences are persisted in browser local storage.
- The `animationEngine.js` file contains all step-generation logic for every supported structure.
- `dataStructures.js` holds the full configuration — default states, complexities, code snippets, and category metadata for all 19 structures.
