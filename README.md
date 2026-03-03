# TestMaster Platform (Frontend)

TestMaster is a high-concurrency, multi-tenant educational platform designed for creating, managing, and taking online assessments, heavily optimized for SSC/Banking exam patterns.

## Features Implemented

- **Multi-Tenant Architecture:** Scalable SaaS structure where each school/institution operates within its own dedicated tenant namespace.
- **Role-Based Access Control (RBAC):** Distinct dashboards and interfaces for Super Admins, Tenant Admins, Teachers, Students, and Parents.
- **High-Concurrency Test Taking (1 Lakh+ Users):**
  - **SSC/Banking UI Pattern:** Split-pane interface with an advanced question palette (Answered, Not Answered, Marked for Review, Not Visited), synchronized countdown timer, and exam-appropriate layouts.
  - **Serverless Redis (Upstash):** Implemented to cache test structures and user attempt grids, dramatically reducing database reads during exams.
  - **Asynchronous Database Writes:** Job queues handle answers being synced to the primary Postgres database to prevent write bottlenecks.
  - **Realtime WebSockets (Ably):** Immediate push updates ensuring answer states map perfectly to the UI without aggressive network polling.
- **AI Integrations:**
  - Automatic generation of questions and explanations for teachers.
  - AI-calculated "Rescue Tests" to dynamically target and improve student weak points.
  - AI qualitative grading for subjective questions.
- **Comprehensive Analytics:** Detailed statistical views and charts for individual student performance and overall tenant test results.

## Tech Stack Overview

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Radix UI + Lucide Icons
- **State Management:** React Hooks + Context
- **API Communication:** Axios via Custom hooks with Tenant Header interceptors
- **Realtime:** Ably SDK
- **Deployment Target:** Vercel

## Getting Started

First, ensure the backend (`testmaster-api`) is running on `localhost:8000`.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the outcome. You can login using tenant credentials (e.g. `student0@demo.com` with `password`).
