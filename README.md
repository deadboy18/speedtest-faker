<p align="center">
  <img src="og-image.png" alt="Speedtest Faker" width="600">
</p>

<h1 align="center">⚡ Speedtest Faker</h1>

<p align="center">
  Search Ookla servers · See speed tiers · Generate fake speedtest.net results with real links
</p>

<p align="center">
  <a href="https://deadboy18.github.io/speedtest-faker/">
    <img src="https://img.shields.io/badge/▶_Live_Demo-GitHub_Pages-5b9aff?style=for-the-badge&logo=github" alt="Live Demo">
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/python-3.6+-45d483?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.6+">
  &nbsp;
  <img src="https://img.shields.io/badge/dependencies-zero-a78bfa?style=for-the-badge" alt="Zero Dependencies">
</p>

---

## What Is This?

A tool that generates **real speedtest.net result links** with whatever speed values you want. Pick an Ookla server, set your fake download/upload/ping, hit generate — get a shareable link and image that look identical to a real test.

**🔗 [Try the live demo →](https://deadboy18.github.io/speedtest-faker/)**

---

## Setup

There are two ways to run this. Both produce the same result — real `speedtest.net/result/XXXXX` links.

### Option A: GitHub Pages + Cloudflare Worker (online, no install)

Host the UI on GitHub Pages and deploy a free Cloudflare Worker as a CORS proxy. Everything runs in the cloud — no Python, no local server.

**Step 1 — GitHub Pages**

1. Fork or clone this repo
2. Go to **Settings → Pages → Source: main branch**
3. Your site goes live at `https://deadboy18.github.io/speedtest-faker/`

**Step 2 — Cloudflare Worker** (free, 100k requests/day)

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
2. Install Wrangler and deploy:
   ```bash
   npx wrangler login
   npx wrangler deploy
   ```
   Or do it manually: **Cloudflare Dashboard → Workers & Pages → Create → "Hello World"** → replace the code with the contents of `worker.js` → **Deploy**
3. Copy your worker URL (e.g. `https://speedtest-faker-proxy.yourname.workers.dev`)

**Step 3 — Connect them**

Open `index.html` and set the worker URL on this line near the top of the `<script>`:

```javascript
const WORKER_URL = 'https://speedtest-faker-proxy.yourname.workers.dev';
```

Commit, push, done. GitHub Pages now has full functionality — search + generate, no Python needed.

### Option B: Local Python server (offline, instant)

Run the Python backend. No accounts, no setup, no dependencies.

```bash
git clone https://github.com/deadboy18/speedtest-faker.git
cd speedtest-faker
python server.py
```

Open **http://localhost:8888**. That's it. Works on Python 3.6+ with zero pip installs.

### Option C: Just open the HTML

Double-click `index.html`. Server search and generation will attempt to call Ookla's API directly — works in some browsers, may be blocked by CORS in others.

---

## Features

- **🔍 Server Search** — Live search Ookla's 15,000+ server database by city, country, or ISP
- **📊 Speed Tier Badges** — Estimated max speed (10G / 40G / 100G) based on known providers
- **⚡ Quick Presets** — One-click fills for 1 Gbps, 10 Gbps, Fiber, Cable, 5G, Trash WiFi, and more
- **🔗 Real Link Generation** — Produces actual `speedtest.net/result/XXXXX` URLs
- **📋 Full Server List** — Browse and filter the complete Ookla server database
- **🌍 Auto Timezone** — Detects your timezone and shows what the result timestamp will be
- **📱 Mobile Friendly** — Responsive card layout, touch-optimized buttons
- **🖼️ Link Previews** — Open Graph tags for rich previews on WhatsApp, Discord, Telegram
- **🔖 Bookmarklet** — Runs directly on speedtest.net — no CORS, no rate limits, no proxy
- **🥚 Easter Eggs** — [There are a few...](#-easter-eggs)

---

## How It Works

1. **Server Search** queries Ookla's public API:
   ```
   https://www.speedtest.net/api/js/servers?engine=js&search=...
   ```

2. **Result Generation** POSTs to Ookla's result endpoint with your fake values:
   ```
   https://www.speedtest.net/api/api.php
   ```

3. The POST requires an MD5 hash computed as:
   ```
   md5("$ping-$upload-$download-297aae72")
   ```
   This is computed client-side in JavaScript — no server needed for the math.

4. Ookla returns a `resultid` → maps to a real `speedtest.net/result/XXXXX` URL with a shareable image.

**Why is a proxy needed?** Ookla's API doesn't send CORS headers, so browsers block cross-origin responses. The proxy (either `server.py` or the Cloudflare Worker) forwards the request server-side and adds `Access-Control-Allow-Origin: *` to the response.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Browser (index.html)                                    │
│  ├── Computes MD5 hash client-side                       │
│  ├── Detects mode automatically:                         │
│  │   ├── localhost? → use server.py proxy                │
│  │   ├── WORKER_URL set? → use Cloudflare Worker proxy   │
│  │   └── fallback → try Ookla API directly               │
│  └── Renders results                                     │
├──────────────────────────────────────────────────────────┤
│  Bookmarklet (bookmarklet.js)                            │
│  └── Injected on speedtest.net → same-origin POST        │
│      → no proxy needed, no CORS, no rate limits          │
├──────────────────────────────────────────────────────────┤
│  Proxy (either one)                                      │
│  ├── server.py (Python, local)                           │
│  └── worker.js (Cloudflare Worker, cloud)                │
│      └── Forwards requests to Ookla API + adds CORS      │
├──────────────────────────────────────────────────────────┤
│  Ookla API                                               │
│  ├── /api/js/servers → server search                     │
│  └── /api/api.php → result generation                    │
└──────────────────────────────────────────────────────────┘
```

---

## Speed Tier Estimates

The tier badges are heuristic guesses based on the server's sponsor name. Ookla's API doesn't expose actual server bandwidth.

| Tier | Typical Providers |
|------|-------------------|
| **100 Gbps** | i3D.net, FDCservers, Hetzner, OVH, Vultr, Leaseweb, Hurricane Electric |
| **40 Gbps** | Comcast, AT&T, Deutsche Telekom, BT, Virgin Media, Orange, Swisscom |
| **10 Gbps** | Most ISPs, regional providers, smaller telecoms |

---

## 🥚 Easter Eggs

<details>
<summary><b>Click to reveal</b> (or find them yourself — open DevTools console for hints)</summary>

<br>

| Trigger | How | What Happens |
|---------|-----|--------------|
| **Konami Code** | `↑↑↓↓←→←→BA` on keyboard | Matrix rain (15s auto-stop) |
| **Logo Clicks** | Click the ⚡ logo 7 times fast | Party mode + confetti |
| **Footer** | Triple-click the footer text | Secret credits toast |
| **Shake** | Shake your phone | Confetti burst |
| **Search: "help"** | Type `help` in search + Enter | Konami code hint |
| **Search: "speedtest"** | Type `speedtest` + Enter | Snarky message |
| **Search: "ookla"** | Type `ookla` + Enter | Who? |
| **Speed: 69 / 6969** | Set download or upload | Nice 😏 |
| **Speed: 420** | Set download or upload | Blazing fast 🔥 |
| **Speed: 42** | Set download or upload | Hitchhiker's Guide 🌌 |
| **Speed: 1337** | Set download or upload | h4x0r detected 🎮 |
| **Speed: 9999 + 9999** | Set both DL and UL | UNLIMITED POWER ⚡ |
| **Ping: 0** | Set ping to 0 | Time traveler? ⏳ |
| **Ping: ≥ 9000** | Set ping to 9000+ | It's over 9000!! |
| **Speed: 0.01** | Set download or upload | NASA WiFi 🐌 |

**Console bonus:** Type `easter()` in DevTools console for the full table.

</details>

---

## 🔖 Bookmarklet (easiest method)

The bookmarklet runs **directly on speedtest.net** — same origin, your IP, no CORS, no rate limits, no proxy. This is the best way to use Speedtest Faker.

1. Visit your hosted site (GitHub Pages or localhost)
2. Go to the **Tools** tab
3. Drag the **⚡ Speedtest Faker** button to your bookmarks bar
4. Navigate to [speedtest.net](https://www.speedtest.net)
5. Click the bookmarklet → a panel appears → set values → generate

The bookmarklet panel is draggable, has all the presets, auto-detects the current server when possible, and works on both desktop and mobile.

> Can't drag? Copy the bookmarklet link and create a bookmark manually, pasting it as the URL.

---

## Files

```
├── index.html        ← The UI (GitHub Pages / local / standalone)
├── server.py         ← Python proxy for local use
├── worker.js         ← Cloudflare Worker proxy for online use
├── wrangler.toml     ← Worker deploy config (npx wrangler deploy)
├── bookmarklet.js    ← Bookmarklet script (injected on speedtest.net)
├── og-image.png      ← Social preview image (WhatsApp/Discord/Telegram)
└── README.md
```

---

## Timestamp Note

Speedtest.net result timestamps use **GMT/UTC**, not your local timezone. The tool auto-detects your timezone and shows you the offset in the Tools tab — so if you're at UTC+8 and generate at 11 PM local, the result shows 3 PM.

---

## License

For educational and prank purposes only. Not affiliated with Ookla.
