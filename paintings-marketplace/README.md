# Gallery & Co. — Your Painting Marketplace

A working starter for a "sell-my-paintings-online" store, built with:
- **Backend:** Node.js + Express + SQLite (a real database, but just one file — no server install needed)
- **Frontend:** React + Vite (fast, modern React tooling)
- **Auth:** Simple JWT login just for you (the artist/admin)
- **Uploads:** Painting photos stored on the server, served back to the site

This is a genuine full-stack app you can run today, and a base you'll extend. It is **not** wired to a real payment processor yet — that's Phase 6 below, on purpose, so you understand the app before money moves through it.

---

## Part 1 — What you need to install (do this once)

| Tool | What it's for | Link |
|---|---|---|
| **Node.js (LTS version)** | Runs your backend, and builds your React frontend | https://nodejs.org |
| **VS Code** | Code editor | https://code.visualstudio.com |
| **Git** | Version control, and how you'll deploy | https://git-scm.com |
| **GitHub account** | Stores your code online, connects to hosting | https://github.com |

Recommended VS Code extensions: **ES7+ React snippets**, **Prettier**, **SQLite Viewer**.

**Verify install** — open a terminal and run:
```bash
node -v      # should print v18 or v20+
npm -v
git --version
```

---

## Part 2 — Understand the shape of the app (10 minutes, read before coding)

An e-commerce site is really three separate things talking to each other:

1. **Frontend (React)** — what the customer sees and clicks. Runs in the browser.
2. **Backend (Node/Express)** — the API. Handles "give me the list of paintings," "log the admin in," "place this order." Runs on your server.
3. **Database (SQLite here)** — where paintings, and orders are permanently stored.

The frontend never touches the database directly — it always asks the backend, and the backend is the only thing allowed to touch the database. This separation is *why* this architecture (the "MERN-style" stack) scales from a hobby project to Amazon-sized systems: each layer can be rebuilt or scaled independently.

```
 Browser (React)  --fetch()-->  Express API  --SQL-->  SQLite file
      |                              |
   localStorage                  uploads/ folder (painting photos)
   (cart only)
```

---

## Part 3 — Run the project locally (Phase 0: get it working, ~30–45 min)

I've already written the full app for you below (in this project folder). Here's how to run it.

### Step 1: Backend setup
```bash
cd backend
npm install                     # downloads all backend libraries (~1-2 min)
cp .env.example .env            # create your real config file
```
Open `.env` in VS Code and set:
```
PORT=4000
JWT_SECRET=make-this-a-long-random-sentence-nobody-can-guess
ADMIN_EMAIL=your-real-email@example.com
ADMIN_PASSWORD=pick-a-strong-password
```

Start the backend:
```bash
npm run dev
```
You should see: `API running on http://localhost:4000`
Visit http://localhost:4000 in a browser — you should see "Painting marketplace API is running."

### Step 2: Frontend setup (open a **second** terminal, leave the backend running)
```bash
cd frontend
npm install                     # downloads React + libraries (~1-2 min)
npm run dev
```
You should see something like `Local: http://localhost:5173/`. Open that URL.

You now have a working store: browsing (empty at first), a cart, checkout, and an admin login.

### Step 3: Log in as the artist and add your first painting
1. Go to `http://localhost:5173/login`
2. Enter the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`
3. You'll land on `/admin` → click **"+ Add Painting"**
4. Fill in title, price, upload a photo → **Publish Painting**
5. Go back to the homepage — your painting is now listed and buyable.

If something fails, read the exact error message first — 90% of first-run issues are: backend not running, wrong `.env` values, or being in the wrong folder when you run `npm install`.

---

## Part 4 — How the code is organized (so you can extend it yourself)

```
paintings-marketplace/
  backend/
    server.js            → starts the API, wires everything together
    db.js                → creates the SQLite database + tables
    routes/
      products.js         → list/add/edit/delete paintings, image upload
      orders.js           → checkout, admin order list
      auth.js              → admin login
    middleware/auth.js     → checks you're logged in before admin actions
    uploads/                → painting photos live here
  frontend/
    src/
      api.js               → the ONLY file that calls fetch() — everything else calls api.xxx()
      context/CartContext.jsx → the shopping cart (shared across all pages)
      pages/                → one file per page/URL
      components/            → reusable pieces (Navbar, ProductCard, Footer)
      index.css              → the whole visual design system (colors, type, layout)
```

**The rule that makes this maintainable:** every page component only ever imports from `api.js` to talk to the backend, and only ever imports `useCart()` to touch the cart. If you want to change how data is fetched later (e.g. add caching), you change it in one file.

---

## Part 5 — Roadmap for what to build next, in order

Doing this "minute by minute" isn't realistic for a project this size — but here is a realistic, ordered plan with time estimates. Treat each phase as a milestone: don't move on until it works.

### Phase 1 — Make it genuinely yours (1–2 evenings)
- [ ] Replace "Gallery & Co." branding in `Navbar.jsx`, `index.html` title, and `Footer.jsx` with your real name/brand
- [ ] Swap the color palette in `index.css` (`:root` variables at the top) if you want a different mood
- [ ] Add all your real paintings through `/admin/new`
- [ ] Write real "About the Artist" content (add a new page — see Phase 3)

### Phase 2 — Product experience polish (1 evening)
- [ ] Add categories/tags (e.g. "Landscapes", "Abstract") — new DB column + filter dropdown
- [ ] Support multiple photos per painting (front, close-up, in-a-room) — requires a second `product_images` table
- [ ] Add a "sold" ribbon overlay on the card when `stock <= 0` (CSS only)

### Phase 3 — More pages (1 evening)
- [ ] `/about` — your story as an artist and engineer
- [ ] `/contact` — a simple form (can just email you via a backend route)
- [ ] Add these routes to `App.jsx` the same way the existing pages are added

### Phase 4 — Real image hosting (half a day)
Right now images live on your server's disk. That's fine for launch, but for a production site, use a dedicated image host so photos load fast worldwide:
- **Cloudinary** (free tier, easiest) — https://cloudinary.com
- Swap the `multer` disk storage in `backend/routes/products.js` for Cloudinary's upload SDK. Their docs have a copy-pasteable Node.js example.

### Phase 5 — Shipping & tax logic (half a day)
Paintings need real shipping costs (they're fragile and often large). Add a `shipping_cost` field to checkout — either a flat rate, or by size/weight. Keep it simple first: one flat domestic rate + one flat international rate.

### Phase 6 — **Real payments** (this is the big one, budget a full day)
Never take card numbers yourself — use a processor. For India, the two common choices:
- **Razorpay** (https://razorpay.com) — built for Indian businesses, UPI/cards/netbanking, easy KYC
- **Stripe** (https://stripe.com) — great docs, more international-friendly

The pattern is the same for both:
1. Frontend calls your backend to "create an order" (as it already does)
2. Backend calls Razorpay/Stripe to create a **payment intent/order**, returns a client secret/order id
3. Frontend loads the processor's checkout widget with that id — card details never touch your server
4. Processor sends your backend a **webhook** confirming payment succeeded
5. Only THEN do you mark the order as paid and reduce stock for real

Both companies have a "Node.js + React quickstart" in their docs — follow it exactly first with test keys before touching real money.

### Phase 7 — Deploy so the world can see it (half a day)
You need two things hosted: the backend API, and the frontend build.
- **Backend:** Render.com or Railway.app (both have generous free tiers, deploy straight from GitHub, support Node + persistent disk for SQLite/uploads)
- **Frontend:** Vercel or Netlify (deploy React static builds straight from GitHub, free tier is plenty)
- **Domain:** buy one from Namecheap/GoDaddy (~$10–15/year), point it at your frontend host

Steps:
1. Push this whole project to a GitHub repo (`git init`, `git add .`, `git commit`, create repo on GitHub, `git push`)
2. On Render/Railway: "New Web Service" → connect your repo → set root directory to `backend` → add your `.env` values in their dashboard (never commit `.env` to GitHub — it's already in `.gitignore`)
3. On Vercel: "New Project" → connect repo → root directory `frontend` → build command `npm run build` → output dir `dist`
4. In `frontend/vite.config.js`, the `proxy` only works locally — in production you'll instead set an environment variable like `VITE_API_URL` and update `api.js` to use it instead of `/api`. (Ask me when you get here — I'll walk you through it.)

### Phase 8 — Trust & polish before real customers (half a day)
- [ ] HTTPS (automatic on Render/Vercel/Railway)
- [ ] A real Terms of Sale / Returns / Shipping policy page — buyers of physical art expect this
- [ ] Order confirmation emails (use Resend.com or SendGrid — a few lines of Node code in `orders.js`)
- [ ] Basic analytics (Plausible or GA4) so you know what's selling

---

## Part 6 — Things worth learning properly (not just copy-pasting)

You said you're an engineer, so you'll pick these up fast — but be deliberate about *where* you spend real learning time versus copy-paste time:

- **Learn deeply:** React fundamentals (components, state, props, hooks) — https://react.dev/learn (the official tutorial is excellent and free)
- **Learn deeply:** how HTTP APIs work (verbs, status codes, JSON) — you'll reuse this everywhere
- **Copy-paste and adapt confidently:** payment processor integration code, email-sending code, CSS — these are solved problems, don't reinvent them
- **Skim once, revisit when needed:** SQL — you know enough from this project; go deeper only if you outgrow SQLite

---

## Part 7 — Troubleshooting first-timer issues

| Symptom | Likely cause |
|---|---|
| `npm install` fails | You're in the wrong folder — must be inside `backend/` or `frontend/` |
| Frontend loads but no paintings ever appear, network errors in browser console | Backend isn't running, or is running on a different port than `vite.config.js` expects |
| "Invalid email or password" on login | `.env` values don't match what you're typing — restart backend after editing `.env` |
| Uploaded image doesn't show | Check `backend/uploads/` actually contains the file; restart backend after first install |
| Changes to `.env` don't seem to apply | You must restart `npm run dev` for the backend — it only reads `.env` at startup |

---

You now have a real, running full-stack e-commerce app and a concrete order of operations to turn it into your actual business. Go slowly through Phase 0 first — everything after depends on that foundation actually working on your machine.
