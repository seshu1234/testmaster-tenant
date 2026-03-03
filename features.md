TestMaster
AI-Powered Multi-Tenant Test Platform for Coaching Centres
Document Product Requirements Document (PRD)
Version v2.0 — Architecture Update
Date February 2026
App Name Test Master
Primary Domain testmaster.in
Status Updated Draft — For Review
Initial Scale 50 Coaching Centres / 10,000 Students
Scale Target 1,000 Coaching Centres / 1 Lakh Students
What Changed in v2.0
App renamed to Test Master. Frontend migrated from Livewire to Next.js 14 across all apps. Architecture changed from monorepo to 4 completely separate Git repos deployed independently. Laravel is now pure API only (JSON) + Blade for emails/PDFs. Tenant branding/colour palette feature added. All apps hosted on Vercel; Laravel API on Railway.

Executive Summary
Test Master is a cloud-native multi-tenant SaaS platform enabling coaching centres to create, schedule, and administer AI-assisted tests online. The platform supports 1 lakh+ concurrent test-takers with real-time leaderboards, AI question generation, offline-safe test taking, tenant branding customisation, and deep analytics — all delivered via 4 independent Next.js apps backed by a single Laravel JSON API.

1. Product Overview
   1.1 Brand Identity
   Item Detail
   App Name Test Master
   Tagline The Smarter Way to Test
   Primary Domain testmaster.in
   Secondary Domain testmaster.app
   Primary Colour #1E40AF — Trust Blue
   Accent Colour #3B82F6 — Energy Blue
   Target Market Coaching Centres, India
   Social Handle @testmasterapp (Twitter, Instagram, LinkedIn)
   1.2 Problem Statement
   Coaching centres in India rely on paper-based tests or generic tools like Google Forms — which offer no AI assistance, no real-time analytics, no concurrent test management, and no multi-centre isolation. There is no affordable, purpose-built SaaS platform that handles the full lifecycle of test creation, administration, result processing, and performance analytics for small-to-mid coaching centres.

1.3 Vision
"The most powerful, affordable, and easy-to-use AI-powered test platform for every coaching centre in India — from 20 students to 1 lakh."

1.4 Goals
Enable coaching centres to go fully digital within 1 day of signup

Deliver AI-assisted question generation that saves teachers 80% of creation time

Handle surprise mock tests for all students simultaneously — zero manual scaling

Support 1 lakh concurrent test-takers through architecture — not frontend framework choice

Provide actionable performance insights for students, teachers, and centre owners

Allow each coaching centre to brand the platform with their own colours and logo

Scale from 50 to 1,000 coaching centres with infra upgrades only — zero code changes

1.5 Success Metrics
Metric 6-Month Target 12-Month Target
Paying tenants 50 200
MRR ₹2,00,000 ₹8,00,000
Students on platform 10,000 40,000
Tests conducted/month 2,000 10,000
Tenant churn rate < 5%/month < 3%/month
Test completion rate > 95% > 97%
Concurrent peak (stress) 10,000 users 1,00,000 users 2. System Architecture — 4 Independent Repositories
Core Architectural Decision
Test Master is built as 4 completely separate Git repositories, each deployed independently. There is no monorepo. Frontend apps (Repos 1-3) are built with Next.js 14 and hosted on Vercel. The backend (Repo 4) is a pure JSON API built with Laravel 11, hosted on Railway. All frontend apps communicate with the API via HTTPS — never directly to the database.

2.1 Repository Overview

# Repo Name URL Stack Hosted On

1 testmaster-web testmaster.in Next.js 14 SSG/SSR Vercel
2 testmaster-superadmin app.testmaster.in Next.js 14 + shadcn Vercel
3 testmaster-tenant {tenant}.testmaster.in Next.js 14 + Zustand + Dexie + Ably Vercel
4 testmaster-api api.testmaster.in Laravel 11 + Octane Railway
2.2 Repo 1 — Marketing Site (testmaster-web)
URL testmaster.in
Stack Next.js 14 (App Router) — Static + SSR
Homepage — hero, features, testimonials, pricing CTA

Pricing page — plan comparison (Starter / Growth / Pro)

Features page — detailed feature breakdown

Blog — SEO content, statically generated at build time

Register page — coaching centre signup form, calls API to create tenant, redirects to subdomain

Login redirect — detects if user has a tenant, redirects to {tenant}.testmaster.in/login

Contact page

No authentication required — fully public

2.3 Repo 2 — Super Admin (testmaster-superadmin)
URL app.testmaster.in
Stack Next.js 14 + shadcn/ui + TanStack Query
Accessible only to Test Master team — separate Sanctum guard

Dashboard — total centres, MRR, active tests, error rates

Tenants — list, search, suspend, reactivate, view usage

Impersonation — log in as any tenant admin for support

Subscriptions — manage, override, extend trials

Plans — edit pricing, limits, AI credit allocations

Billing dashboard — MRR, ARR, churn, plan distribution

AI usage — OpenAI credit consumption per tenant

Announcements — broadcast message to all tenants

Platform settings — feature flags, maintenance mode

2.4 Repo 3 — Tenant App (testmaster-tenant)
URL {tenant}.testmaster.in
Stack Next.js 14 + Zustand + TanStack Query + Dexie.js + Ably SDK
Design Decision
All tenant-facing roles (Admin, Teacher, Student, Parent) live in ONE Next.js app — including test taking. Role-based route groups protect each section. Middleware reads the subdomain, identifies the tenant, and injects it into every API request via X-Tenant header. No separate test-taking app needed.

Route Groups by Role
Role Route Prefix Key Pages
Centre Admin /admin/_ Dashboard, Students, Teachers, Batches, Analytics, Branding, Subscription
Teacher /teacher/_ Question Bank, AI Generator, Test Builder, Live Monitor, Results
Student /student/_ Dashboard, Tests, Lobby, Take Test, Results, Leaderboard, Progress
Parent /parent/_ Children Overview, Child Progress, Result History
Test Taking — Critical Path
Why Next.js Handles 1 Lakh Users (Not Alpine.js or Livewire)
Scale at 1 lakh concurrent users is handled by the BACKEND architecture (Redis answer buffer, PgBouncer connection pooling, Horizon queue workers, Ably managed WebSockets, Cloudflare CDN edge caching) — NOT by the frontend framework. Next.js is chosen because: Zustand manages complex test session state cleanly, Dexie.js provides rock-solid IndexedDB offline safety, TanStack Query handles API sync with built-in retry logic, and Vercel auto-scales globally with zero server management.

Test Taking route: /student/tests/[testId]/take

Zustand store holds: answers, flagged questions, current index, time left, tab switch count, sync status

Dexie.js (IndexedDB) saves every answer locally — survives page refresh, network loss, browser crash

Answers synced to API every 30 seconds in background — non-blocking

On submit: answers flushed from IndexedDB → API → Redis → PostgreSQL via queue

Ably JS SDK listens for ResultReady WebSocket event — auto-redirects to result page

Timer runs client-side (Alpine.js-style via React state) — no server round trips

Fullscreen enforced — tab switches tracked and reported to teacher via Ably

2.5 Repo 4 — Laravel API (testmaster-api)
URL api.testmaster.in
Stack Laravel 11 + Sanctum + Octane (Swoole) + Horizon
Laravel Scope — API + Emails/PDFs Only
Laravel serves pure JSON API responses to all Next.js apps. No Blade views for UI. Blade is used exclusively for: transactional email templates (welcome, test scheduled, result released, subscription expiring) and PDF generation (result cards, bulk result exports). All UI rendering happens in Next.js.

Pure JSON REST API — all responses follow consistent envelope format

stancl/tenancy v3 — tenant identification via X-Tenant header or subdomain

Row-level isolation — BelongsToTenant trait on every model, global scope auto-applied

Laravel Sanctum — token-based auth, separate guards per role

Laravel Octane with Swoole — keeps workers in memory, 5-10x faster than PHP-FPM

Laravel Horizon — queue monitoring, auto-scales workers to 50 on load spike

Blade templates — emails (Resend) and PDFs (DomPDF) only

Laravel Broadcasting — broadcasts events to Ably (result ready, AI complete, tab switch alerts)

3. Complete Technology Stack
   3.1 Per-Repository Stack
   Repo Core Libraries Notes
   testmaster-web (Marketing) Next.js 14, Tailwind CSS, shadcn/ui Mostly static (SSG). SSR only for registration form.
   testmaster-superadmin (Super Admin) Next.js 14, shadcn/ui, TanStack Query, Recharts, TanStack Table CSR — not SEO sensitive. Auth via httpOnly cookie.
   testmaster-tenant (All Tenant Roles) Next.js 14, shadcn/ui, Zustand, TanStack Query, Dexie.js, Ably JS SDK, Recharts SSR for branding injection (no colour flash). CSR for dashboards. Critical: Zustand + Dexie for test taking.
   testmaster-api (Laravel API) Laravel 11, Sanctum, Octane (Swoole), Horizon, stancl/tenancy, DomPDF, Laravel Excel, Spatie Permissions JSON API only. Blade for emails + PDFs. No UI rendering.
   3.2 Infrastructure & Services
   Layer Service Provider Purpose
   Database PostgreSQL + PgBouncer Supabase Pro Primary data store. PgBouncer pools 10k+ connections to 50 real DB connections.
   Cache + Queue Redis (Serverless) Upstash Answer buffers, leaderboards (Sorted Sets), sessions, rate limiting, job queues.
   WebSockets Managed WebSocket Ably Result notifications, live test monitoring, AI job completion, tab switch alerts. Handles 1 lakh+ concurrent connections.
   File Storage S3-compatible Object Store Cloudflare R2 Question images, PDFs, student uploads, result cards. Zero egress cost.
   CDN + DNS CDN + DDoS + Wildcard DNS Cloudflare Wildcard \*.testmaster.in set once. Test papers cached at edge — zero origin requests during live test.
   Frontend Hosting Edge + Serverless Vercel All 3 Next.js apps. Auto-scales globally. Zero server management.
   API Hosting Auto-scaling Containers Railway Laravel API + Horizon workers. Scales on CPU spike. Web service + separate worker service.
   Email Transactional Email Resend Welcome emails, test notifications, result alerts, subscription reminders.
   Payments Payment Gateway Razorpay UPI, debit/credit card, net banking. Subscription webhooks to Laravel.
   AI LLM API OpenAI GPT-4o Mini Question generation, explanations, performance insights. Called via Laravel queued jobs only.
   Error Tracking Error Monitoring Sentry All 4 repos instrumented. Alerts within 1 minute of new error type.
   Uptime Uptime Monitoring Better Stack Alert if api.testmaster.in down > 60 seconds.
4. Multi-Tenancy Architecture
   4.1 Subdomain Strategy — Fully Automatic
   Zero Manual DNS Per Tenant
   One wildcard DNS record (\*.testmaster.in) is set once in Cloudflare. Every new coaching centre that registers automatically gets a working subdomain — no manual DNS work, no server config, no deployment required. The subdomain is active within seconds of registration.

Tenant Resolution Flow
Request arrives at brightminds.testmaster.in/student/tests

Cloudflare routes to Railway via wildcard A record

Next.js middleware (Repo 3) extracts subdomain 'brightminds', sets X-Tenant: brightminds header

All API calls include X-Tenant: brightminds header automatically

Laravel IdentifyTenant middleware reads X-Tenant header

Resolves tenant from central DB (cached in Redis for 1 hour)

tenancy()->initialize($tenant) — sets DB scope, storage prefix, cache prefix

BelongsToTenant global scope auto-applied — all queries filtered by tenant_id

Request proceeds in fully isolated tenant context

4.2 Data Isolation Model
Strategy Security Guarantee
Single PostgreSQL database with tenant_id column on every table. Global scope auto-filters all queries. Separate DB per tenant is not needed at 50-1000 centres — adds cost and operational complexity with no benefit at this scale. BelongsToTenant trait on every model. Automated CI test verifies every model has the trait. A tenant's Sanctum token cannot be used to access another tenant's API endpoints — separate auth guards enforce this.
4.3 Tenant Branding (NEW)
Feature Overview
Each coaching centre can customise their subdomain to match their own brand identity. Students and teachers see the centre's colours and logo — not Test Master's default theme. This is a key retention and upsell feature.

Branding Tiers by Plan
Feature Starter Growth Pro
Choose from 9 curated palettes ✓ ✓ ✓
Upload centre logo ✓ ✓ ✓
Custom hex colour picker — ✓ ✓
Login page custom banner — ✓ ✓
Custom welcome message — ✓ ✓
Branded result card PDFs — ✓ ✓
Hide 'Powered by Test Master' — — ✓
Custom domain (centre.com) — — ✓ Add-on ₹999/mo
9 Curated Colour Palettes
Palette Name Primary Accent Background
Ocean Blue (Default) #1E40AF #3B82F6 #EFF6FF
Forest Green #065F46 #10B981 #ECFDF5
Sunset Orange #C2410C #F97316 #FFF7ED
Royal Purple #5B21B6 #8B5CF6 #F5F3FF
Crimson Red #991B1B #EF4444 #FEF2F2
Slate Grey #1E293B #64748B #F8FAFC
Golden Yellow #92400E #F59E0B #FFFBEB
Teal #134E4A #14B8A6 #F0FDFA
Rose Pink #9D174D #EC4899 #FDF2F8
How Branding Is Applied Technically
Branding config stored in tenant_branding table in PostgreSQL

On app load: Next.js layout.tsx fetches branding server-side (SSR) from API

CSS custom properties injected into <html> tag before first paint — zero colour flash

Tailwind config uses CSS variables: bg-primary, text-accent, bg-background

All components use semantic colour names — palette swap requires zero component changes

Logo uploaded to Cloudflare R2, served via CDN, cached at edge

Branding cached in Redis for 1 hour — API not hit on every page load

Admin updates branding → API invalidates Redis cache → new branding live within 1 minute

5. Scale Architecture — 1 Lakh Concurrent Users
   5.1 Why Scale Is a Backend Problem, Not Frontend
   Key Insight
   The choice between Next.js, Livewire, or Alpine.js does NOT determine whether 1 lakh users can be handled. Scale is determined entirely by the backend architecture: how answers are buffered, how connections are pooled, how jobs are queued, and how WebSockets are managed. Next.js is chosen for its developer experience and Vercel's auto-scaling — not because it handles scale better than alternatives.

5.2 Answer Saving Flow (Most Critical)
Student selects answer → Zustand state updated instantly (zero latency UI update)

Answer saved to IndexedDB via Dexie.js immediately (offline protection — survives network loss)

Batched API POST every 30 seconds (not on every click)

Laravel writes to Redis hash — sub-millisecond, not DB (Redis handles 500k ops/sec)

Scheduled job flushes Redis answers to PostgreSQL every 2 minutes

DB never sees 1 lakh simultaneous writes — Redis absorbs the entire spike

5.3 Submission Flow (Thundering Herd Problem)
The Problem
When a test timer ends, all students submit simultaneously. Without architecture, this creates a thundering herd — 1 lakh requests hitting the DB at the same second. This is solved by queuing.

Timer ends → final answers flushed from IndexedDB to API

API flushes Redis answers to DB → dispatches CalculateResult job → returns HTTP 202 immediately

Student sees 'Calculating your result...' screen — Ably WebSocket listening

Horizon auto-scales to 50 workers on queue depth spike

50 workers process 1 lakh jobs in parallel — all results done in ~20 minutes

Each result: score saved to DB + pushed to Redis Sorted Set (leaderboard)

Ably broadcasts ResultReady event to individual student channel

Student UI auto-redirects to result page

5.4 Auto-Scaling — No Manual Intervention Ever
Component Scale Trigger Mechanism
Laravel API containers CPU > 60% for 2 minutes Railway auto-adds containers (60-90 second spin-up)
Horizon queue workers Queue depth > 200 jobs maxProcesses: 50 in Horizon config
PostgreSQL connections Always pooled PgBouncer: 10k app connections → 50 real DB connections
Redis Serverless — always ready Upstash scales elastically, billed per request
WebSocket connections Managed service Ably handles 1 lakh+ concurrent connections globally
Next.js frontend Automatic Vercel edge network — scales to any traffic globally
Cloudflare CDN Always on Test questions cached at edge — zero origin requests for content delivery
5.5 Infrastructure Cost at Scale
Centres Students Peak Concurrent Infra/month AI/month Est. MRR
50 10,000 10,000 ~$110 ~$15 ₹2.2 Lakhs
200 40,000 40,000 ~$400 ~$60 ₹8.8 Lakhs
500 1,00,000 1,00,000 ~$900 ~$150 ₹22 Lakhs
1,000 2,00,000 1,00,000 ~$2,800 ~$300 ₹38 Lakhs 6. Functional Requirements
6.1 Users & Roles
Role App / URL Responsibilities
Super Admin app.testmaster.in Platform owner. Full access: all tenants, billing, analytics, feature flags, impersonation.
Centre Admin {t}.testmaster.in/admin Manage students, teachers, batches. View analytics. Manage subscription and branding.
Teacher {t}.testmaster.in/teacher Build question bank. Create and schedule tests. Use AI generation. Monitor live tests. View results.
Student {t}.testmaster.in/student View and take tests. View results, leaderboard, AI insights. Track performance over time.
Parent {t}.testmaster.in/parent View child's test history, scores, and subject-wise performance (read-only).
6.2 Question Bank
Types: MCQ (single), MCQ (multiple), True/False, Fill in the Blank, Match the Following, Short Answer

Tags: Subject, Chapter, Topic, Difficulty (Easy/Medium/Hard), Source, AI-generated flag

Rich text editor — supports LaTeX equations and image uploads

Bulk import via downloadable Excel template

Search and filter by any tag combination

Duplicate detection — warns if similar question exists

Version history — edits don't break existing tests using the question

6.3 AI Features
AI Question Generator
Input: topic, difficulty, question type, quantity (up to 50 per request)

Optional: upload PDF/notes — AI extracts context and generates from content

Teacher reviews, edits inline, selects which to save to bank

1 AI credit consumed per generation request

AI Explanation Generator
Step-by-step solution explanations for any question

Triggered per question or bulk for entire test

Shown to students after result release

Performance Insights
AI analyses student test history — generates personalised improvement advice

Generated monthly or on-demand

Shown on student dashboard

Auto-Difficulty Tagging
AI suggests difficulty level when teacher creates question manually

Teacher can accept or override

6.4 Test Builder
Basic info: title, subject(s), instructions, language

Settings: duration, marks, negative marking, pass percentage, shuffle questions/options

Sections (optional): named sections with independent time limits

Add questions: search bank, filter, drag to reorder, set per-question marks

Schedule: immediate, specific date/time, or manual start

Assign: select batches or individual students

Review and publish: preview as student, then publish or save draft

6.5 Test Taking
Pre-test lobby: countdown, system check, instructions, fullscreen prompt

Fullscreen enforced — tab switches logged, teacher alerted after 3 occurrences

Timer top-right — orange at 10 min, red at 5 min remaining

Question palette — colour-coded: answered (green), flagged (orange), answered+flagged (purple), not visited (grey)

Auto-save every 30 seconds — sync indicator shown

Submit with confirmation modal — shows answered/unanswered/flagged summary

Auto-submit on timer end

Offline safety — all answers in IndexedDB, synced when connection restores

6.6 Results & Analytics
Instant result calculation via queue — student notified via WebSocket when ready

Score, percentage, rank (batch + centre), percentile

Section-wise breakdown: score, accuracy, time spent

Question review: your answer vs correct, AI explanation

Downloadable PDF result card (branded with centre logo/colours)

Leaderboard powered by Redis Sorted Sets — sub-50ms response

Teacher analytics: score distribution, question-wise analysis, batch comparison

Centre admin analytics: trends, subject weak areas, teacher productivity

6.7 Subscription & Billing
Feature Starter Growth Pro
Price/month ₹1,999 ₹4,499 ₹8,999
Annual (2 months free) ₹19,990 ₹44,990 ₹89,990
Max Students 100 400 1,000
AI Credits/month 50 250 Unlimited
Branding Palette only Full branding White label
Support Email Priority Email Dedicated
14-day free trial — no credit card required

Payment via Razorpay: UPI, debit/credit card, net banking

Annual plans billed upfront — 2 months free

Additional AI credit packs: ₹499 / 100 credits

Cancellation: access until period end, then read-only

7. Database Schema (High Level)
   7.1 Central Database
   Table Key Columns
   tenants id, slug, name, plan_id, status, created_at
   plans id, name, price_monthly, price_annual, student_limit, teacher_limit, ai_credits
   subscriptions id, tenant_id, plan_id, status, trial_ends_at, current_period_ends_at
   super_admins id, name, email, password
   7.2 Tenant Database (All tables include tenant_id)
   Table Key Columns
   users id, tenant_id, name, email, role (admin/teacher/student/parent), batch_id, status
   tenant_branding id, tenant_id, palette_name, primary_color, accent_color, background_color, logo_url, favicon_url, login_banner_url, welcome_message, hide_powered_by, custom_css
   batches id, tenant_id, name, subject, teacher_id
   questions id, tenant_id, type, content (JSON), options (JSON), answer, explanation, topic, difficulty, ai_generated, created_by
   tests id, tenant_id, title, settings (JSON), status, start_at, end_at, duration_seconds, created_by
   test_sections id, test_id, tenant_id, name, order, time_limit
   test_questions id, test_id, question_id, section_id, order, marks, negative_marks
   test_batches test_id, batch_id (pivot)
   attempts id, tenant_id, test_id, student_id, status, started_at, submitted_at
   answers id, attempt_id, question_id, selected_option (JSON), is_correct, time_spent_seconds
   results id, tenant_id, attempt_id, student_id, test_id, score, percentage, rank, percentile, breakdown (JSON)
   ai_usage_logs id, tenant_id, feature, credits_used, prompt_tokens, completion_tokens, created_at
   Complete Final Stack
   Layer Technology Hosted On
   API / Backend Laravel 11 + Sanctum + Octane Railway
   Multi-tenancy stancl/tenancy + row-level scoping —
   Queue Laravel Horizon + Redis Railway worker
   Student/Teacher/Admin UI Next.js 14 + TypeScript + Tailwind + shadcn Vercel
   Super Admin UI Next.js 14 + shadcn Vercel
   State (test session) Zustand + TanStack Query —
   Offline safety Dexie.js (IndexedDB) —
   Real-time Ably + Laravel Broadcasting Ably cloud
   Database PostgreSQL (Supabase Pro) Supabase
   Cache / Queue broker Redis (Upstash) Upstash
   File storage Cloudflare R2 Cloudflare
   Email Resend Resend
   Payments Razorpay Razorpay
   AI OpenAI GPT-4o mini OpenAI
   DNS / CDN Cloudflare Cloudflare
   Monitoring Sentry + Better Stack Cloud
   Monthly cost at 50 centres: ~$90–130/month
   Scales to 1000 centres with infra upgrades only — zero architecture changes needed

URL Structure
URL Purpose
yourapp.com Marketing / Landing
app.yourapp.com Super Admin (your team)
{tenant}.yourapp.com Tenant Hub (all roles login here)
{tenant}.yourapp.com/admin Centre Admin Dashboard
{tenant}.yourapp.com/teacher Teacher Dashboard
{tenant}.yourapp.com/student Student Dashboard + Test Taking
{tenant}.yourapp.com/parent Parent Portal
api.yourapp.com Laravel API (backend only)
7.3 Redis Key Patterns
Key Pattern Purpose
attempt:{id}:answers Hash — in-progress answer buffer. Flushed to DB on submit.
test:{id}:paper JSON cache of test questions. Served on test start from cache, not DB.
leaderboard:test:{id} Sorted Set — student_id scored by result. O(log n) rank lookup.
tenant:{slug}:meta Cached tenant config — avoids DB lookup on every request.
tenant:{slug}:branding Cached branding config — served to Next.js layout SSR.
ratelimit:{tenant}:{ip} API rate limiting counters. 300 req/min per tenant. 8. API Design
8.1 Base URL & Tenant Identification
Base URL: api.testmaster.in/v1/

Tenant ID: Passed via X-Tenant header (slug) OR extracted from subdomain of request origin.

Auth: Bearer token (Laravel Sanctum) in Authorization header.

8.2 Response Envelope
Success: { "success": true, "data": {...}, "meta": { "page": 1, "total": 100 } }

Error: { "success": false, "error": { "code": "TENANT_NOT_FOUND", "message": "...", "fields": {} } }

8.3 Endpoint Groups
Guard Prefix Example Endpoints
Super Admin /v1/central/ GET /tenants, POST /tenants/{id}/suspend, GET /platform/analytics
Centre Admin /v1/admin/ GET /students, POST /batches, GET /analytics/overview, PATCH /branding
Teacher /v1/teacher/ POST /tests, GET /questions, POST /ai/generate, GET /tests/{id}/live
Student /v1/student/ GET /tests, POST /tests/{id}/start, POST /attempts/{id}/answers, POST /attempts/{id}/submit
Parent /v1/parent/ GET /children, GET /children/{id}/results, GET /children/{id}/progress
Public /v1/central/public/ POST /register, GET /plans, GET /check-subdomain 9. Security
9.1 Tenant Data Isolation
BelongsToTenant trait on every Eloquent model — global scope auto-filters all queries by tenant_id

Automated CI test: verifies every model file has BelongsToTenant trait (fails build if missing)

Sanctum tokens are tenant-scoped — token from Tenant A cannot access Tenant B API

File storage paths prefixed with tenant_id — cross-tenant file access impossible

X-Tenant header validated against authenticated user's tenant — cannot spoof

9.2 Authentication
Passwords: bcrypt, cost factor 12

Token expiry: 7 days rolling

Rate limiting: 60 req/min per IP on auth endpoints

Rate limiting: 300 req/min per tenant on API

Super admin guard entirely separate — cannot log in via tenant login page

9.3 Test Integrity
Fullscreen enforced on test start — exit triggers warning, teacher notified after 3 occurrences via Ably

Tab switch detection — counted, logged per attempt, visible in teacher live monitor

Questions and options shuffled per student (configurable per test)

Test paper served from Redis cache — re-fetching prevented

Answer submission requires valid attempt_id belonging to authenticated student

9.4 Infrastructure Security
All traffic: TLS 1.3 enforced by Cloudflare

API: CORS configured to allow only testmaster.in and \*.testmaster.in origins

Environment secrets: managed in Railway and Vercel environment variable vaults

No PII in application logs — only anonymised identifiers

AI prompts contain no student personal data — only performance metrics

10. Deployment & CI/CD
    10.1 Per-Repo Deployment
    Repo Platform Trigger Deploy Time
    testmaster-web Vercel Push to main ~30 seconds
    testmaster-superadmin Vercel Push to main ~45 seconds
    testmaster-tenant Vercel Push to main ~60 seconds
    testmaster-api Railway Push to main ~2 minutes
    Each repo deploys completely independently — deploying the API never affects Next.js apps

Laravel deployment runs migrations automatically before traffic switches

Railway uses zero-downtime rolling restarts — no downtime on API deploys

Vercel preview deployments on every PR — stakeholders can review before merge

10.2 Environment Branches
Branch Environment URL Pattern
main Production testmaster.in, api.testmaster.in
staging Staging staging.testmaster.in, api-staging.testmaster.in
feature/\* Preview (Vercel auto) {hash}.vercel.app (frontend only) 11. Development Roadmap
Phase 1 — Foundation (Weeks 1–4)
Goal: All 4 repos scaffolded and deployed. First tenant can register, login, and see a dashboard.

Repo scaffold: all 4 repos created, CI/CD configured, deployed to Vercel/Railway

Cloudflare wildcard DNS configured

Laravel: central DB schema, tenant registration, Sanctum auth, stancl/tenancy

Next.js (tenant app): middleware for subdomain detection, login page, role-based routing

Tenant isolation test suite written and passing

Phase 2 — Question Bank & Test Builder (Weeks 5–8)
Goal: Teachers can build a full test and publish it to students.

Question bank CRUD — all question types, tagging, search

Bulk Excel import

Test builder wizard (6-step)

Test scheduling and batch assignment

Student: view available tests, lobby page

Phase 3 — Test Taking & Results (Weeks 9–12)
Goal: Students can take tests and see results. Core product loop complete.

Test taking UI — timer, palette, flags, fullscreen, auto-save

Zustand store + Dexie.js IndexedDB offline safety

Redis answer buffer pipeline

Auto-submit, result calculation jobs, Horizon workers

Result page — score, rank, percentile, question review

Leaderboard (Redis Sorted Sets)

Ably WebSocket — ResultReady notification

Teacher live monitor

Phase 4 — AI Features (Weeks 13–15)
Goal: AI question generation live. Core differentiator launched.

OpenAI GPT-4o Mini integration via Laravel queued jobs

AI Question Generator with review flow

PDF upload to question generation

AI Explanation Generator

Auto-difficulty tagging

AI credit tracking and enforcement

Phase 5 — Branding, Billing & Polish (Weeks 16–18)
Goal: Production-ready. First paying customers onboarded.

Tenant branding — 9 colour palettes, logo upload, CSS variable injection

Razorpay subscription billing

Plan limits enforcement

Email notifications (Resend — all templates)

Centre Admin and Teacher analytics dashboards

Student performance insights (AI)

Super Admin platform dashboard

Marketing site (testmaster.in)

Sentry + Better Stack monitoring

Phase 6 — Post-Launch (Months 5–6)
Parent portal

Bulk PDF result card generation

Hindi language support

WhatsApp notification integration

Mobile PWA optimisation

Custom domain support (Pro plan add-on)

12. Infrastructure Cost at 50 Centres
    Service Plan / Usage Cost/month
    Railway — Laravel API + Workers Usage-based auto-scaling $20–40
    Vercel — 3 Next.js Apps Pro ($20 covers all 3) $20
    Supabase — PostgreSQL + PgBouncer Pro plan $25
    Upstash — Redis Pay per request $5–10
    Ably — WebSockets Free tier (6M msgs/month) $0
    Cloudflare — DNS + CDN + R2 Free + R2 pay-per-use $2
    Resend — Email Free tier (3k/day) $0
    OpenAI — GPT-4o Mini Pay per token $10–15
    Sentry + Better Stack Free tiers $0
    TOTAL ~$82–112/month
    12.1 Revenue at 50 Centres
    Plan Centres Price/month MRR
    Starter 20 ₹1,999 ₹39,980
    Growth 20 ₹4,499 ₹89,980
    Pro 10 ₹8,999 ₹89,990
    Total MRR 50 ₹2,19,950 (~$2,640)
    Gross margin: ~93% after all infrastructure costs

13. Non-Functional Requirements
    Requirement Target
    API response time p95 < 200ms cached, < 500ms DB reads
    Test question delivery < 300ms (Redis cache, not DB)
    Answer save acknowledgement < 100ms (Redis write)
    Result calculation per student < 3 seconds
    All 1 lakh results calculated < 20 minutes (50 Horizon workers)
    Next.js LCP (4G mobile) < 1.5 seconds
    Leaderboard load < 50ms (Redis Sorted Set)
    Platform uptime 99.9% (< 8.7 hours downtime/year)
    Error alert time < 1 minute (Sentry)
    API downtime alert < 60 seconds (Better Stack)
    Branding change propagation < 1 minute (Redis cache invalidation)
14. Open Questions

# Question Options Status

1 Should AI credits roll over month to month? Rollover vs expire TBD
2 Parent access to results — default on or admin opt-in? Default on vs opt-in TBD
3 Essay/subjective questions in v1.0? Yes vs defer to v2 Deferred
4 WhatsApp notifications — which provider? Twilio / Interakt / WATI TBD
5 Should custom domain be v1.0 Pro feature or post-launch? v1 vs post-launch TBD
6 Trademark filing for 'Test Master' in Class 41? File early vs later Recommended ASAP 15. Glossary
Term Definition
Tenant A coaching centre registered on Test Master with its own subdomain and isolated data
Attempt A student's session for a specific test — started, in-progress, or submitted
AI Credit One unit of AI usage — consumed per AI generation request regardless of question count
Horizon Laravel's queue monitoring and auto-balancing worker management dashboard
PgBouncer PostgreSQL connection pooler — 10k app connections routed through 50 real DB connections
Redis Sorted Set Redis data structure used for leaderboards — O(log n) rank insert and lookup
Dexie.js Browser IndexedDB wrapper — stores test answers locally for offline safety
Zustand Lightweight React state manager — holds active test session state in memory
stancl/tenancy Laravel package handling tenant context switching per HTTP request
Octane Laravel package that runs app in Swoole/RoadRunner — keeps workers in memory for 5-10x speed
Thundering Herd Problem where all users submit simultaneously — solved by queuing submissions via Horizon
MRR Monthly Recurring Revenue
LCP Largest Contentful Paint — Google's key metric for page load performance
— End of Document —

Test Master PRD v2.0 | Confidential | testmaster.in
World-Class Dashboard Metrics for All Roles
Executive Summary
Drawing from best practices at companies like Stripe, Salesforce, Mixpanel, Amplitude, and Tableau, here are comprehensive, actionable metrics for each role in TestMaster. These dashboards are designed to drive decisions, not just display data.

🎯 Universal Dashboard Design Principles
Principle Implementation
Actionable Every metric should lead to a specific action
Contextual Compare vs. yesterday, last week, last month, targets
Hierarchical Overview → Detailed breakdown → Individual records
Real-time Live updates for critical metrics
Annotated Notes on anomalies, achievements, events
Exportable PDF/Excel/CSV with one click
Shareable Create shareable snapshots for stakeholders

1. SUPER ADMIN DASHBOARD (/admin)
   🏢 Platform Overview
   KPI Cards (Top Row)
   Metric Description Benchmark Visual
   Total Tenants Active + trial centres Growth % Big number + trend sparkline
   MRR (Monthly Recurring Revenue) Subscription revenue $ vs target Progress bar to goal
   ARR Annual Run Rate $ Big number
   Gross MRR Churn Revenue lost to cancellations < 2% Trend with alert
   Net MRR Churn Churn - upgrades > 0% Green/Red indicator
   Quick Ratio (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR) > 4 Gauge chart
   LTV (Customer Lifetime Value) Avg revenue per tenant over lifetime $ Trend
   CAC (Customer Acquisition Cost) Cost to acquire a tenant $ Payback period
   Revenue Deep Dive

MRR by Plan: Starter / Growth / Pro breakdown with counts

MRR by Cohort: 3, 6, 12-month cohort analysis

Revenue Waterfall: Month-over-month changes

Forecast: Next 3 months projected MRR with confidence intervals

Annual Runway: Months of operation at current burn rate

Tenant Health
Metric Description Action Trigger
Active Tenants Paid + active trial < 95% = alert
At-Risk Tenants Low usage, expiring soon List with contact info
Trial → Paid Conversion % of trials converting < 20% = investigate
Tenant Health Score Composite of usage, support tickets, payments Heatmap
Cohort Retention % retained by month Cohort table
Daily Active Centres Centres with activity today Sparkline
Stickiness DAU / MAU ratio > 20% = good
User Metrics
Total Students: Platform-wide

Total Teachers: Platform-wide

Active Users (DAU/WAU/MAU): With trend

Users per Tenant: Average, distribution

Power Users: Top 10% by activity

Dormant Users: No activity >30 days

Test Analytics
Metric Description Visual
Tests Created (Total) All-time Big number
Tests Taken (Daily) Today's completions Sparkline
Avg Tests per Centre Monthly average Bar chart by plan
Peak Concurrent Tests Max simultaneous Last 30 days
Questions Generated Total + AI-generated % Pie chart
Avg Test Completion Rate Started vs finished Trend
Avg Score Platform-wide average Trend
AI Usage & Costs
Metric Description Alert
Total AI Credits Used Monthly Big number
AI Credit Consumption by Feature Generation vs explanations Stacked bar
OpenAI Cost (Daily) $ spent Trend
Cost per 1K Questions Efficiency metric < $0.50
Top AI Users By credits consumed List
Credit Utilization by Plan Starter vs Growth vs Pro Bar chart
Financial Health
Metric Description Target
Gross Margin Revenue - COGS > 85%
Burn Rate Monthly cash consumption < ₹5L
Runway Months until cash zero > 12 months
Avg Revenue Per User (ARPU) Per tenant Trend
Refund Rate % of revenue refunded < 2%
Failed Payments Count + amount Alert on spike
Technical Performance
Metric Description SLO
API Latency (p95/p99) Response time <200ms / <500ms
Error Rate 5xx responses < 0.1%
Queue Depth Horizon jobs pending >200 = alert
Worker Utilization % busy 70% target
Database Connections Active Near limit?
Cache Hit Rate Redis > 90%
CDN Offload % served from edge > 95%
Uptime (30-day) By service 99.9%
Support & Operations
Metric Description SLA
Open Support Tickets By priority < 10 critical
Avg First Response Time Hours < 4h
Avg Resolution Time Hours < 24h
CSAT Score Customer satisfaction > 4.5/5
NPS (Net Promoter Score) Promoters - Detractors > 50
Tickets by Category Billing, technical, feature Pie chart
Security & Compliance
Metric Description Alert
Failed Login Attempts Last 24h Spike = alert
Suspicious Activity Flags By tenant List
API Key Usage By key Anomaly detection
Data Export Requests GDPR compliance Count
Penetration Test Status Last run Due soon?
Growth & Acquisition
Metric Description Visual
New Signups (Daily) Registrations Sparkline
Signup Sources Organic, paid, referral Pie chart
CAC by Channel Cost per channel Bar chart
Conversion Funnel Visit → Signup → Trial → Paid Funnel chart
Time to First Value Days to first test created Histogram
Viral Coefficient Invites sent per user K-factor
Executive Summary Widgets
Health Scorecard: Red/Yellow/Green for all key metrics

Top 5 Risks: Items needing attention

Recent Wins: Success stories, big deals

Daily Snapshot: Email-ready summary

2. CENTRE ADMIN DASHBOARD (/{tenant}/admin)
   🏛️ Centre Overview
   KPI Cards (Top Row)
   Metric Description Benchmark
   Total Students Active + inactive vs capacity
   Total Teachers Active vs plan limit
   Tests This Month Created vs target
   Completion Rate % finished > 95%
   Average Score All tests Trend
   Plan Utilization Students/Teachers vs limit Progress bar
   Days Until Renewal Subscription end Countdown
   Outstanding Balance If applicable Alert if due
   Revenue & Business Health (For Centre Owners)
   Metric Description Visual
   MRR Contribution Monthly revenue to TestMaster Big number
   Student Lifetime Value Avg revenue per student Trend
   Cost Per Test (Teacher time + materials) / tests Comparison
   ROI Calculator Savings vs manual Live update
   Referral Credits From referring other centres Balance
   Student Performance Overview
   Metric Description Action
   Average Class Score All tests combined Trend
   Score Distribution A, B, C, D, F grades Histogram
   Top Performers Top 10 students List with scores
   Bottom Performers Bottom 10 students Intervention needed
   Performance by Subject Subject-wise averages Bar chart
   Performance by Batch Batch comparison Radar chart
   Improvement Rate Avg score change over time +5% target
   Students at Risk Declining performance List with alerts
   Teacher Performance
   Metric Description Visual
   Tests Created per Teacher Monthly Bar chart
   Avg Student Score by Teacher Teacher effectiveness Comparison
   Teacher Engagement Last login, activity Heatmap
   Teacher Satisfaction Survey results (if collected) Trend
   Class Size per Teacher Students assigned Distribution
   Batch & Class Analytics
   Metric Description Action
   Batch Performance Ranking Best to worst Bar chart
   Batch Size Distribution Histogram Optimal 20-30
   Batch Completion Rate % finishing tests < 90% = alert
   Subject Performance by Batch Heatmap Weak areas
   Attendance Rate % taking tests Trend
   Peer Comparison Batch vs batch Leaderboard
   Test Analytics
   Metric Description Visual
   Tests Created (Monthly) Trend Sparkline
   Tests Scheduled Upcoming Calendar view
   Tests in Progress Live now Count + students
   Avg Test Duration Planned vs actual Comparison
   Most Difficult Tests By lowest avg score List
   Most Popular Tests By participation List
   Question Difficulty Analysis Easy/Medium/Hard distribution Pie chart
   Financial (For Centre Owners)
   Metric Description Target
   Subscription Status Active/Trial/Expired Status
   Next Billing Date Upcoming Countdown
   Payment History Last 6 months Table
   Invoice Download GST invoices One-click
   Add-on Purchases AI credits, custom domain Usage
   Estimated Annual Spend Projected Big number
   Cost Per Student Subscription / students Comparison
   Student Engagement
   Metric Description Visual
   Daily Active Students Last 30 days Sparkline
   Tests per Student (Avg) Engagement metric Histogram
   Students with No Tests Last 30 days List for follow-up
   Peak Usage Hours When students study Heatmap
   Device Breakdown Mobile vs Desktop Pie chart
   Offline Usage Tests taken offline Count
   Parent Engagement (If applicable)
   Metric Description Action
   Parents Registered % of students < 50% = promote
   Parent Logins Last 30 days Trend
   Parent-Student Links Verified Count
   Parent Feedback Survey responses Sentiment
   Operational Metrics
   Metric Description Alert
   Pending Invitations Teachers/students not activated Count
   Support Tickets Open List
   Feature Usage Most used features Heatmap
   Storage Used Question images, PDFs % of limit
   API Calls (Monthly) Usage tracking Near limit?
   Benchmarking
   Metric Description Insight
   vs Similar Centres Size comparison Percentile rank
   vs Platform Average All centres Gap analysis
   vs Top 10% Best-in-class Target setting
   Improvement Needed Areas below average Action list
   Export & Reporting
   Generate Report: PDF/Excel with all metrics

Schedule Report: Daily/Weekly/Monthly email

Share Dashboard: Read-only link for stakeholders

Export Raw Data: CSV for custom analysis

3. TEACHER DASHBOARD (/{tenant}/teacher)
   📚 Teacher Command Center
   KPI Cards (Top Row)
   Metric Description Target
   My Classes Batches assigned Count
   My Students Total students Count
   Tests Created This month vs goal
   Tests to Grade Pending (if manual) < 5
   Average Class Score My students Trend
   AI Credits Left This month Progress bar
   Upcoming Tests Scheduled Countdown
   Class Performance Snapshot
   Metric Description Visual
   Class Average by Subject My subjects Bar chart
   Score Distribution Grade breakdown Pie chart
   Top 5 Students Leaderboard Names + scores
   Bottom 5 Students Needs attention Names + action
   Class Progress % through syllabus Progress bar
   Performance Trend Last 6 tests Line chart
   Test Management
   Quick Actions
   Create New Test → Test builder wizard

Schedule Test → Calendar picker

Import Questions → Excel/PDF upload

Generate with AI → Topic input

Test Status Overview
Status Count Action
Drafts 3 Edit/Delete
Scheduled 5 View/Reschedule
Live Now 2 Monitor
Awaiting Grading 0 Grade
Results Ready 8 Publish
Completed 24 Archive
Live Monitor (Critical Feature)
Active Tests Widget
text
┌─────────────────────────────────────┐
│ 🔴 JEE Mock Test - 128 students │
│ Progress: 65% completed │
│ Time left: 32 min │
│ Alerts: 3 tab switches │
│ [Monitor] [End Test] │
├─────────────────────────────────────┤
│ 🟡 Weekly Quiz - 45 students │
│ Progress: 92% completed │
│ Time left: 5 min │
│ Alerts: 0 │
│ [Monitor] [End Test] │
└─────────────────────────────────────┘
Live Proctoring Dashboard
Student Grid: Real-time status (active/warning/violation)

Alert Feed: Tab switches, fullscreen exits

Suspicious Activity Count: By student

Force Submit: Option to end test for student

Broadcast Message: Send to all test-takers

Question Bank Analytics
Metric Description Visual
Total Questions In my bank Count
Questions by Type MCQ, True/False, etc. Pie chart
Questions by Difficulty Easy/Medium/Hard Stacked bar
Questions by Topic Subject distribution Treemap
Most Used Questions In tests List
Question Performance % correct by question Heatmap
AI-Generated % From AI Progress bar
Needs Review Flagged questions Count
AI Usage & Credits
Metric Description Alert
Credits Used This Month 45/250 Progress bar
Credits Left 205 Days remaining
AI Questions Generated Lifetime Count
AI Explanations Generated Lifetime Count
Avg AI Quality Rating Teacher feedback 4.8/5
Estimated Time Saved Hours 24 hrs
Student Performance (Individual)
Top Students
Name Tests Taken Avg Score Rank Trend
Rajesh K. 24 92% #1 ↑
Priya S. 22 89% #2 →
Amit P. 25 87% #3 ↓
Students Needing Attention
Name Tests Taken Avg Score Last Score Action
Vikram S. 18 58% 45% ⚠️ Message
Sneha R. 20 62% 51% ⚠️ Message
Performance Insights (AI-Powered)
Class Weak Areas: Topics with <60% accuracy

Recommended Practice: Suggested questions for weak topics

Improvement Opportunities: Students showing decline

Top Performers: Patterns of success

Predicted Scores: Next test forecast

Schedule & Calendar
Upcoming Tests: List with dates

Test Schedule: Calendar view

Class Schedule: Teaching timetable

Reminders: Upcoming deadlines

Holidays: Academic calendar

Quick Stats Widget

Export & Sharing
Download Class Report: PDF for parents/meetings

Share Dashboard: With department head

Export Grades: To Excel/CSV

Print Result Cards: For distribution

4. STUDENT DASHBOARD (/{tenant}/student)
   🎓 Student Learning Hub
   KPI Cards (Top Row)
   Metric Description Motivation
   Tests Taken Lifetime Count
   Average Score All tests Trend
   Current Rank In class/batch Medal icon
   Study Streak Consecutive days 🔥 15 days
   Tests This Week Completed vs goal
   Badges Earned Achievements Count
   Welcome & Progress
   text
   ┌─────────────────────────────────────┐
   │ 👋 Welcome back, Rahul! │
   │ │
   │ 📊 Your Progress: │
   │ ▰▰▰▰▰▰▰▰▰▰ 85% to next rank │
   │ │
   │ 🎯 Next Goal: Complete 5 more tests │
   │ to unlock "Hard Worker" badge │
   └─────────────────────────────────────┘
   Upcoming Tests (Priority Widget)
   Test Subject Date Duration Status
   JEE Mock Test Mathematics Tomorrow 9 AM 3 hrs ⏰ Ready
   Weekly Quiz Physics Mar 15 1 hr 📝 Not started
   Chapter Test Chemistry Mar 18 2 hrs 📝 Not started
   Action Buttons: [Enter Lobby] [View Details] [Set Reminder]

Recent Results
Test Score Rank Percentile Feedback
JEE Mock #4 85% #12 92% 📊 Review
Quadratic Quiz 92% #3 98% ⭐ Excellent
Electrostatics 68% #45 65% ⚠️ Practice
Performance Analytics
Visual Charts
Score Trend: Last 10 tests (line chart)

Subject-wise Performance: Radar chart

Difficulty Breakdown: Easy/Medium/Hard accuracy

Time Spent vs Accuracy: Scatter plot

Progress Toward Goal: Gauge chart

Key Metrics
Metric Value vs Class Avg
Overall Accuracy 78% +5% ↑
Speed (min/question) 1.2 -0.3 ↓
Consistency 85% +2% ↑
Improvement Rate +12% +3% ↑
AI-Powered Insights
Personalized Recommendations
text
🎯 Based on your performance:

• Focus on: Organic Chemistry (58% accuracy)
• Practice: 5 extra problems daily
• Suggested: "Reaction Mechanisms" mini-test
• Watch: Video tutorial on SN1/SN2 reactions

[Start Practice] [Watch Video]
Weak Area Identification
Topic Accuracy Recommended Action
Organic Chemistry 58% Practice test
Electrostatics 62% Review concepts
Trigonometry 71% Do 3 problems/day
Strength Areas (Celebrate!)
Topic Accuracy Achievement
Algebra 94% 🏆 Master level
Mechanics 91% ⭐ Top 10%
Leaderboards
Rank Name Score Badge
#1 Priya S. 98% 👑
#2 Amit K. 95% ⭐
#3 You 92% 🔥
#4 Vikram R. 91%
Filters: Class / Batch / Centre / All

Gamification & Achievements
Badges Earned
Badge Description Date
🏅 Perfect Score (100%) Mar 1
🔥 15-Day Streak Mar 5
⚡ Speed Demon Feb 20
📚 50 Tests Taken Feb 15
Next Badges to Unlock
Badge Requirement Progress
🎯 Top 10 in class 85%
🌟 90%+ in 5 tests 3/5
Study Streak & Motivation
text
🔥 15 DAY STREAK!
You're on fire! Keep going!

📅 March 2026
M T W T F S S
✅ ✅ ✅ ✅ ✅ ✅ ✅
✅ ✅ ✅ ✅ ✅ ✅ ✅
✅ 🟩 ...
Recommended Tests (AI Curated)
Test Reason Action
Organic Chemistry Practice Weak area identified [Take Test]
Speed Drill: Algebra Improve speed [Take Test]
JEE Advanced Mock Upcoming exam prep [Schedule]
Notifications & Alerts
Test Reminder: JEE Mock in 2 hours

Result Ready: Quadratic Quiz results available

New Badge: You earned "Hard Worker"!

Teacher Message: Review session tomorrow

Study Resources
My Question Bank: Bookmarked questions

AI Explanations: Saved for review

Video Tutorials: Recommended based on weak areas

Practice Sets: Generated by AI

Parent Connect
Share Progress: Send report to parent

Parent Message: View messages

Parent View: What parents see

5. PARENT DASHBOARD (/{tenant}/parent)
   👪 Parent Portal
   KPI Cards (Top Row)
   Metric Description Status
   Children Linked accounts Names
   Recent Activity Last 7 days Summary
   Upcoming Tests Next 7 days Count
   Average Performance All children Trend
   Notifications Unread Count
   Child Selector
   text
   👤 Select Child: [Rahul (12th) ▼] [Priya (10th)]
   Child Performance Snapshot
   For Selected Child
   text
   ┌─────────────────────────────────────┐
   │ 📊 Rahul's Performance │
   │ │
   │ Tests Taken: 24 │
   │ Avg Score: 86% (+5% vs class) │
   │ Class Rank: #12 / 128 │
   │ Study Streak: 15 days 🔥 │
   │ │
   │ [View Detailed Report] [Share] │
   └─────────────────────────────────────┘
   Recent Test Results
   Test Date Score Class Avg Rank Feedback
   JEE Mock #5 Mar 1 85% 72% #15 ✅ Good
   Weekly Quiz Feb 28 92% 78% #8 ⭐ Excellent
   Chapter Test Feb 25 68% 70% #45 ⚠️ Needs practice
   Performance Trends
   Score Trend: Line chart (last 3 months)

Subject-wise Performance: Radar chart

Comparison vs Class: Bar chart

Improvement Rate: % change over time

Subject-wise Breakdown
Subject Score Class Avg Gap Status
Mathematics 92% 78% +14% ✅ Strong
Physics 85% 76% +9% ✅ Good
Chemistry 68% 72% -4% ⚠️ Needs attention
Biology 78% 75% +3% ✅ OK
Upcoming Tests
Test Subject Date Duration Reminder
JEE Advanced Mock Full Mar 10 3 hrs [Set Reminder]
Chemistry Test Organic Mar 15 2 hrs [Set Reminder]
Teacher Feedback
Date Teacher Message
Mar 1 Mr. Sharma Rahul is improving in Maths, but needs to focus on Chemistry.
Feb 20 Ms. Patel Good participation in class discussions.
AI-Generated Insights for Parents
text
📈 Insights for Rahul:

Strengths: Mathematics (92%), Physics (85%)
Areas for Improvement: Chemistry (68%)
Recommended: Practice 30 min/day on Organic Chemistry
Prediction: With current trend, expected rank improvement to top 10 by April

[View Practice Recommendations]
Comparison Dashboard
Metric Your Child Class Avg Top 10%
Overall Score 86% 78% 94%
Tests Taken 24 20 28
Consistency 85% 80% 92%
Improvement +12% +8% +15%
Notifications
Test Result Ready: Rahul scored 85% on JEE Mock

Upcoming Test: Chemistry test on Mar 15

Teacher Message: Parent-teacher meeting on Mar 20

Achievement: Rahul ranked #8 in weekly quiz!

Communication
Message Teacher: Direct link

Schedule Meeting: Calendar integration

Receive Reports: Email/PDF preferences

Feedback Form: Share concerns

Report Downloads
Download Full Report: PDF with all metrics

Download Subject Report: Detailed by subject

Share with Counselor: Export option

Print Summary: For records

Multiple Children View (Toggle)
text
┌─────────────────────────────────────┐
│ Family Dashboard │
├─────────────────────────────────────┤
│ 👤 Rahul (12th) │
│ Avg: 86% | Rank: #12 │
│ Needs: Chemistry │
├─────────────────────────────────────┤
│ 👤 Priya (10th) │
│ Avg: 94% | Rank: #3 │
│ Needs: Nothing! 🎉 │
├─────────────────────────────────────┤
│ 👤 Amit (8th) │
│ Avg: 78% | Rank: #25 │
│ Needs: Mathematics │
└─────────────────────────────────────┘
📊 Dashboard Design Best Practices
Visual Design Principles
Principle Implementation
Information Hierarchy Most important metrics top-left (F-pattern)
Consistent Color Coding Green=good, Yellow=warning, Red=alert, Blue=neutral
White Space Don't cram; let data breathe
Progressive Disclosure Summary → Details → Raw data
Mobile Responsive Collapsible sections, touch-friendly
Accessibility WCAG 2.1 AA compliant
Interaction Patterns
Pattern Usage
Hover for Details Tooltips on all metrics
Click to Drill Down KPI → Detailed view → Individual records
Date Range Selector Custom date picker everywhere
Save Views Bookmark filtered views
Export Data One-click CSV/PDF
Share Dashboard Create shareable link with permissions
Annotations Add notes to metrics
Alerts Configure threshold alerts
Real-time Updates
WebSocket connections for live data

Auto-refresh every 30 seconds for critical dashboards

Push notifications for alerts

Last updated timestamp on all cards

Empty States
No data yet: Friendly message + suggested action

Loading states: Skeleton screens

Error states: Retry option + support contact

Dashboard Customization
Widget picker: Add/remove widgets

Layout editor: Drag-drop rearrange

Theme selector: Light/dark mode

Default views: Role-based defaults

🎯 Key Performance Indicators by Role (Summary)
Role Top 3 KPIs
Super Admin MRR, Gross Churn, LTV/CAC
Centre Admin Student Growth, Avg Score, Plan Utilization
Teacher Class Avg Score, Test Completion Rate, AI Usage
Student Avg Score, Rank, Study Streak
Parent Child's Avg Score, Class Rank, Needs Attention
📈 Advanced Analytics Features
Predictive Analytics (AI-Powered)
Student Performance Prediction: Forecast next test score

At-Risk Detection: Identify students likely to drop

Churn Prediction: Tenants likely to cancel

Recommendation Engine: Suggested tests/questions

Optimal Test Timing: Best time to schedule

Cohort Analysis
Student Cohorts: By join date, batch, performance

Retention Curves: How long students stay active

Behavioral Cohorts: High vs low engagement

Funnel Analysis
Test Creation Funnel: Start → Publish

Test Taking Funnel: Start → Complete → Review

Conversion Funnel: Trial → Paid → Renewal

Heatmaps
Peak Usage Times: When students study

Question Difficulty: Which questions cause trouble

Feature Usage: Most/least used features

Custom Reports Builder
Drag-drop metrics

Schedule delivery

Multiple formats (PDF, Excel, CSV, JSON)

White-label reports (for centre admins)
