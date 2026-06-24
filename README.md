\# Shift Handoff Tool



An AI-powered tool that turns raw end-of-shift notes into clear, structured handoff summaries — built to solve a real problem at my job.



\*\*Live app:\*\* https://shift-handoff-tool.onrender.com



\## The problem



I'm a Shift Lead at a Wingstop in Denton, TX. Promises made to customers during one shift (remakes, refunds, callbacks) were getting lost before the next shift started, since there was no consistent way to record and pass them along. This led to repeat complaints and frustrated customers who'd been told something would be handled, but no one on the next shift knew about it.



\## What it does



\- Shift leads fill out a simple form at the end of their shift: their name, the date/shift, any specific customer promises made (with customer name, order time, and what was promised), and general notes (inventory, staffing, prep needed).

\- The app sends this to Claude (Anthropic's AI model) via the API, which generates a clean, structured handoff summary.

\- Customer promises are always surfaced first, in a clearly flagged section, so the next shift lead can't miss them.

\- Every summary is saved automatically, so the next person who opens the app can see recent handoffs even if they weren't the one who generated it.



\## How it's built



\- \*\*Backend:\*\* Node.js + Express, calling the Claude API (`@anthropic-ai/sdk`) to generate summaries

\- \*\*Frontend:\*\* Plain HTML/CSS/JavaScript, mobile-responsive

\- \*\*Storage:\*\* Summaries persisted server-side so they survive across sessions and devices

\- \*\*Deployment:\*\* Hosted on Render, with API credentials handled via environment variables (never committed to the repo)



\## What I'd improve next



\- Move from flat-file storage to a small real database for more reliable persistence

\- Add basic authentication so only Wingstop staff can submit/view handoffs

\- Let shift leads mark a customer promise as "resolved" once it's been handled



\## Background



This was my first time working with Node.js, Express, Git/GitHub, and deploying an app to the cloud. I built it as a hands-on way to learn the Claude API while solving a problem I deal with directly at work, debugging real issues (API key handling, file mix-ups, mobile layout, persistent storage) along the way.

