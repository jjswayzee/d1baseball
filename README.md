# ⚾ D1 Baseball – Power 4 Live Scores

Live college baseball scoreboard for SEC, ACC, Big 12, and Big Ten.  
Pulls real-time data from ESPN. Click any game for full box scores + player stats.

---

## 🚀 Deploy in 5 minutes (FREE)

### Step 1 – Install dependencies
```bash
npm install
```

### Step 2 – Run locally to test
```bash
npm run dev
```
Open http://localhost:3000 — you should see live scores.

### Step 3 – Deploy to Vercel (free hosting)

1. Go to **https://vercel.com** and sign up with GitHub (free)
2. Click **"Add New Project"**
3. Click **"Import"** next to this repo  
   *(or drag & drop the project folder)*
4. Leave all settings as default — click **"Deploy"**
5. Done. Vercel gives you a free URL like `d1baseball.vercel.app`

### Step 4 – Custom domain (optional, ~$12/year)
- Buy a domain at Namecheap or Google Domains (e.g. `d1baseball.com`)
- In Vercel → Project Settings → Domains → add your domain
- Point your domain's DNS to Vercel (they walk you through it)

---

## How it works

- **`/app/page.js`** — Scoreboard with all Power 4 games, filtered by conference tab
- **`/app/game/[id]/page.js`** — Individual game page with full box score + player stats
- **`/app/api/scoreboard/route.js`** — Server-side ESPN fetch (no CORS issues)
- **`/app/api/game/route.js`** — Server-side game summary fetch
- **`/lib/espn.js`** — All ESPN API logic and data parsing

Data refreshes every **30 seconds** automatically.

---

## Monthly cost
| Item | Cost |
|---|---|
| Vercel hosting | FREE |
| ESPN data | FREE (unofficial API) |
| Domain name | ~$12/year (optional) |
| **Total** | **$0–$1/month** |

---

Built with Next.js 14 + ESPN's unofficial API.
