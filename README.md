# ⬡ FLOATING LIFE OS
### Futuristic 3D Habit Tracker & Performance Optimization System

---

## 🚀 QUICK START (Run Locally)

### Option A — Direct Open (No Server Needed)
1. Download all files into a single folder:
   - `index.html`
   - `style.css`
   - `script.js`
   - `manifest.json`
   - `sw.js`

2. Open `index.html` in your browser (Chrome/Edge recommended for best 3D performance).

> **Note:** The PWA service worker requires a server. For full PWA support, use Option B.

---

### Option B — Local Server (Recommended)

**Using Python:**
```bash
cd floating-life-os
python3 -m http.server 8080
# Open: http://localhost:8080
```

**Using Node.js (npx):**
```bash
cd floating-life-os
npx serve .
# Open the URL shown in terminal
```

**Using VS Code:**
Install the "Live Server" extension → Right-click `index.html` → "Open with Live Server"

---

## 🤖 AI ASSISTANT SETUP (Claude API)

The AI Advisor uses the Anthropic Claude API. To enable it:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)

2. The app calls the API directly from the browser. For production, proxy through a backend.

3. Without an API key, the app uses an intelligent **rule-based fallback** that analyzes your actual habit data locally — still very useful!

---

## ☁️ DEPLOY TO NETLIFY

1. Go to [netlify.com](https://netlify.com) → "Add new site" → "Deploy manually"
2. Drag and drop your project folder
3. Done! Your app is live at a `*.netlify.app` URL

**Or via Netlify CLI:**
```bash
npm install -g netlify-cli
cd floating-life-os
netlify deploy --prod
```

---

## ☁️ DEPLOY TO VERCEL

```bash
npm install -g vercel
cd floating-life-os
vercel --prod
```

---

## 📱 INSTALL AS PWA

After deploying (or running on localhost):
- **Chrome/Edge:** Click the install icon in the address bar
- **Mobile:** Tap "Add to Home Screen" in browser menu

---

## 🎯 FEATURES

| Feature | Status |
|---------|--------|
| 3D Particle Background (Three.js) | ✅ |
| Habit CRUD (Add/Delete/Complete) | ✅ |
| Priority Levels (High/Med/Low) | ✅ |
| Daily Completion Tracking | ✅ |
| Streak System | ✅ |
| XP & Level System | ✅ |
| Achievement Badges | ✅ |
| 7-Day Analytics Charts | ✅ |
| Performance Comparison | ✅ |
| Evolution Engine (Pattern AI) | ✅ |
| AI Advisor (Claude API + Fallback) | ✅ |
| Sound Effects (Web Audio API) | ✅ |
| localStorage Persistence | ✅ |
| PWA (Installable) | ✅ |
| Mobile Responsive | ✅ |
| Theme Toggle | ✅ |

---

## 🗂 FILE STRUCTURE

```
floating-life-os/
├── index.html      # Main HTML + UI structure
├── style.css       # Futuristic dark theme + animations
├── script.js       # All app logic (3D, data, AI, charts)
├── manifest.json   # PWA manifest
├── sw.js           # Service worker (offline support)
└── README.md       # This file
```

---

## 🎨 TECH STACK

- **3D Engine:** Three.js r128
- **Charts:** Chart.js 4.4
- **AI:** Anthropic Claude API (+ local fallback)
- **Storage:** localStorage
- **Audio:** Web Audio API
- **Fonts:** Orbitron + Rajdhani + Share Tech Mono (Google Fonts)
- **PWA:** Service Worker + Web Manifest

---

## 🧠 HOW THE EVOLUTION ENGINE WORKS

The Evolution Engine analyzes your habit data using rule-based pattern recognition:

- **Trend Analysis:** Compares first 3 days vs last 3 days of the week
- **Streak Monitoring:** Tracks consecutive days with 50%+ completion
- **Habit Strength:** Ranks habits by weekly completion rate
- **Time Analysis:** Detects performance patterns by time of day
- **XP Progression:** 10-30 XP per completion, 100 XP per level

---

## 📄 LICENSE

MIT — Free to use, modify, and deploy.

---

*Built with Three.js, Chart.js, and Anthropic Claude.*
