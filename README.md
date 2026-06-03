# 🧠 Structures Visualizer

### Interactive Learning & Visualization Playground

A premium, interactive web application designed to help developers, students, and educators visualize, learn, and experiment with data structures and algorithms in real time.

[![Netlify Status](https://api.netlify.com/api/v1/badges/e8e6b189-d652-4e94-ab6a-dfc846bf48f7/deploy-status)](https://structures-visualizer.netlify.app/)
[![React Version](https://img.shields.io/badge/react-v19.0-blue.svg)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/vite-v8.0-indigo.svg)](https://vite.dev/)

---

## 🌐 Live Application

- **Public URL:** [structures-visualizer.netlify.app](https://structures-visualizer.netlify.app/)
- **Repository:** [github.com/harishnukala90/Structures-Visualizer](https://github.com/harishnukala90/Structures-Visualizer)

### 📱 Scan to Access on Mobile
Scan the QR code below with your mobile device to open the visualizer instantly:

<p align="left">
  <img src="public/qrcode.png" width="180" alt="Scan QR Code to visit Web App" />
</p>

---

## 🎨 Overview & Logo

<p align="center">
  <img src="public/logo.png" width="120" alt="Structures Visualizer Logo" />
</p>

**Structures Visualizer** provides a modern, glassmorphism-themed playground that breaks down complex abstract data types into step-by-step interactive animations. Designed with sleek dark modes, HSL tailored accent colors, and custom micro-animations, it delivers a state-of-the-art educational experience.

---

## ✨ Features

- **19 Supported Data Structures & Algorithms:** Comprehensive interactive simulations spanning primitive, linear, non-linear, and hash-based structures.
- **Multilingual Code Viewer:** Side-by-side code blocks in **C**, **C++**, **Java**, and **Python** highlighting the active execution lines as the animation plays.
- **Interactive Animation Engine:** Full playback controls (Play, Pause, Step Forward, Step Backward, Reset, and Speed Slider) for detailed debugging of state changes.
- **Dynamic Operations HUD:** Direct inputs for searching, inserting, updating, and deleting nodes.
- **Complexity HUD:** Instant lookup for best-case, average-case, and worst-case time and space complexities.
- **Internationalization (i18n):** Multi-language UI support.

---

## 🧱 Supported Structures & Categories

| Category | Data Structures / Algorithms |
| :--- | :--- |
| **Primitives** | `Integer`, `Float`, `Character`, `Boolean`, `Pointer` |
| **Linear** | `1D Array`, `2D Array` (Grid), `Singly Linked List`, `Doubly Linked List`, `Circular Linked List`, `Doubly Circular Linked List`, `Stack`, `Queue`, `Circular Queue`, `Deque` |
| **Non-Linear** | `Binary Search Tree (BST)`, `AVL Tree` (Self-Balancing), `Graph (BFS & DFS Traversals)` |
| **Hash-Based** | `Hash Table` (Chaining Collision Resolution), `Hash Set` |
| **Searching** | `Linear Search`, `Binary Search` (halving bounds visualization) |
| **Sorting** | `Bubble Sort`, `Selection Sort`, `Insertion Sort`, `Merge Sort`, `Quick Sort` |

---

## 🛠️ Technology Stack

- **Framework:** [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (fast HMR build tool)
- **Styling:** Tailwind CSS v4 + Custom Modern HSL Vanilla CSS styling
- **Icons:** [Lucide React](https://lucide.dev/)
- **Localization:** [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)

---

## 🚀 Getting Started (Local Development)

To run the application locally on your machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### Installation & Run

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/harishnukala90/Structures-Visualizer.git
   cd Structure-Visualizer
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Local Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` (or the port specified in terminal).

4. **Build for Production:**
   ```bash
   npm run build
   ```
   The built assets will be generated in the `dist/` directory.

---

## ☁️ Deployment on Netlify using GitHub

This repository is configured for automated Continuous Deployment via Netlify linked with your GitHub repository.

### Netlify Deployment Configuration

Whenever you push to the `main` branch, Netlify will build and deploy your app automatically using these settings:

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** Auto-detected (recommends Node 18+)

### Manual Netlify Linking Steps
1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Choose **GitHub** and authorize access to your repositories.
4. Select the **`Structures-Visualizer`** repository.
5. In the build settings, set:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy Site**. Future commits pushed to GitHub will trigger automatic updates!

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
