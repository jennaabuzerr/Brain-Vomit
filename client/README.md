# 🧠 Brain Vomit

A place to dump every thought crowding your brain — school, events, self care, chores — and let AI sort the chaos into something you can actually act on.

Type it all out, let AI make sense of it. Brain Vomit turns a messy, unfiltered brain dump into an organized, prioritized dashboard, with a countdown to every deadline and a bit of personality along the way.

## What it does

- **Brain Dump screen** — type everything on your mind into a thought bubble and send it to your brain. AI reads the raw text, figures out what's actually being asked, and returns a structured task: name, category, priority, and deadline.
- **Home screen** — every saved task shows up split into "Upcoming" and "Keep in Mind," each with a live countdown (days, hours, and minutes) that updates based on the real current time.
- **Show/hide brain** — toggle between a clean brain graphic and a view of your actual task list living inside the brain, color-coded by category and sized by priority.
- **Declutter / Clear Brain** — remove a single task, or clear everything in one click.
- **Category legend** — a quick-reference key so the color coding always makes sense.

## Tech stack

- **Frontend:** React (Vite), custom CSS (no UI framework — every component, layout, and animation is hand-built)
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)
- **AI:** Google Gemini API, used to parse raw text into structured, categorized tasks

## Getting started

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (in a separate terminal)
cd client
npm install
npm run dev
```

You'll need a Gemini API key in a `.env` file inside `server/`:
```
GEMINI_API_KEY=your_key_here
```

## On my use of AI

I built this project using Claude (Anthropic) as a learning tool, not a code generator. Every line in this repo was written by me — Claude's role was to teach me the concept behind each piece before I wrote it, ask me comprehension questions, and point out bugs for me to actually fix myself rather than handing me corrected code. If I got something wrong, I was told *why* it was wrong and asked to try again, not given the answer.

That workflow is reflected in the commit history and in the fact that I can explain exactly how every part of this app works — from why `useEffect` needs its async logic wrapped in an inner function, to why SQL needs prepared statements, to why absolute positioning needs a `relative` ancestor. I used AI the way I'd want to use a good mentor: to understand things deeply, not to skip understanding them.

## What I'd build next

- User accounts, so brain data actually persists per person
- Weekly/monthly calendar views
- Drag-and-drop task reordering
- Customizable brain appearance

---

Built by Jenna Abuzer as a portfolio project, summer 2026.