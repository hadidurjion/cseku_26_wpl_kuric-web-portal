# Software Requirements Specification

## KURIC Web Portal

*Khulna University Research and Innovation Center*
*An Information & Research-Proposal Management Platform*

**Version:** 1.0
**Date:** 18 August 2026

**Prepared By**
- Hadidur Rahman Jion — Student ID: 220215
- Sadia Afrin Tamanna — Student ID: 220240

**Supervised By**
Engr. Prof. Dr. Kazi Masudul Alam
Computer Science and Engineering Discipline,
Khulna University

---

## 1. Introduction

### 1.1 Purpose

This document specifies the requirements for the KURIC Web Portal — an online platform for the Khulna University Research and Innovation Center (KURIC). The portal will serve as both a public information website and an operational system for managing research proposal submission and review.

### 1.2 Project Scope

KURIC currently has no online presence. This project will build a single, unified platform that (a) presents general information about KURIC to the public, and (b) provides an interactive workflow through which researchers submit proposals, reviewers evaluate them, and KURIC officers manage the overall process and site content.

### 1.3 Team

| Name | Student ID | Responsibility |
|---|---|---|
| Hadidur Rahman Jion | 220215 | Full-stack development, backend & database design |
| Sadia Afrin Tamanna | 220240 | Full-stack development, UI/UX & documentation |

*Both members will jointly contribute to design, development, testing, and documentation of the complete system.*

---

## 2. User Roles

The system supports four categories of users, each with a distinct level of access:

| Role | Access Level | Purpose |
|---|---|---|
| Public / Visitor | No login required | Browse general KURIC information, research, events, and news |
| Researcher (Teacher/Student) | Registered login | Submit and track research proposals |
| Reviewer | Assigned login | Evaluate proposals and give decisions/suggestions |
| KURIC Officer (Admin) | Admin login | Manage content, users, proposals, and appeals |

---

## 3. Functional Requirements

This table breaks down each functional requirement (FR) from the SRS into its individual sub-functionalities, with a Priority level (High / Medium / Low) assigned to each. High priority items form the Minimum Viable Product (MVP) that must be completed within the 6-week timeline; Medium and Low priority items can be treated as enhancements if time permits.

*Four Agentic AI-powered features have been added to this version, integrated directly into the roles they support: an AI virtual assistant/chatbot for the public site (FR-02.3), an AI proposal summarizer for reviewers (FR-08.3), an AI reviewer-matching agent for officers (FR-11.3), and an AI automated report generator for officers (FR-12.4). These are marked "AI-powered (agentic)" in their description.*

### 3.1 Public Website (Visitor — No Login Required)

#### FR-01: Core Informational Pages

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-01.1 | Home page | Hero banner with center name & tagline; statistics counter (projects, publications, funded projects); latest 3-4 news/event preview cards; quick links to key pages | **High** |
| FR-01.2 | About page | Mission, vision, objectives; KURIC history/background; leadership profile (photo, name, bio); organogram if available | **High** |
| FR-01.3 | Research Areas page | List of research projects in card/grid view; category-based filter; detail page per project (objective, team, status, funding) | **High** |
| FR-01.4 | Publications page | List of publications (title, author, year); filter/sort by year or author; downloadable PDF link where available | **High** |
| FR-01.5 | Events/News page | Upcoming events list (date, venue, description); past events archive; news articles with thumbnail, summary, and read-more link | **High** |
| FR-01.6 | Contact page | Inquiry/contact form (name, email, message); address with embedded map; phone/email details | **High** |

#### FR-02: Search & AI Assistant

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-02.1 | Global search bar | Site-wide search bar accessible from all pages | **Medium** |
| FR-02.2 | Cross-content search | Searches across Research, Publications, and News simultaneously; groups results by content type | **Medium** |
| FR-02.3 | AI virtual assistant (chatbot) | AI-powered (agentic) chatbot widget available site-wide for visitors; answers common questions such as "How do I submit a proposal?" or "What research areas does KURIC cover?" by referencing site content; reduces need to manually browse pages | **Medium** |

### 3.2 Researcher Portal (Teacher / Student — Registered Login)

#### FR-03: Registration & Login

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-03.1 | Registration form | Name, email (university email preferred), password, department/designation (Teacher/Student) | **High** |
| FR-03.2 | Login | Secure login form with session/token-based authentication | **High** |
| FR-03.3 | Email verification | Verification link sent to email before account activation | **Medium** |
| FR-03.4 | Forgot password | Password reset link sent via email | **Medium** |
| FR-03.5 | Profile management | Edit profile photo, bio, and contact information | **Low** |

#### FR-04: Proposal Submission Form

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-04.1 | Proposal fields | Title, abstract/summary, objectives, budget breakdown, timeline/duration | **High** |
| FR-04.2 | Co-researcher entry | Add one or more co-researcher names to a single proposal | **Medium** |
| FR-04.3 | File attachment | Upload one or more supporting PDF/DOC files | **High** |
| FR-04.4 | Save as draft | Save incomplete proposal and continue later before final submission | **Medium** |
| FR-04.5 | Final submission | Locks the proposal from further editing until reviewer requests revision | **High** |

#### FR-05: Status Tracking Dashboard

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-05.1 | Proposal list with status | Shows all submitted proposals with status badge: Pending, Under Review, Accepted, Revision Needed, Rejected | **High** |
| FR-05.2 | Status filter | Filter proposal list by current status | **Low** |
| FR-05.3 | Timeline / history view | Shows full history of a proposal — submission date, review date, decision date | **Medium** |

#### FR-06: Feedback & Resubmission

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-06.1 | View reviewer feedback | Researcher can read reviewer comments/suggestions on their proposal | **High** |
| FR-06.2 | Resubmit after revision | Edit and resubmit a proposal marked as Revision Needed | **High** |
| FR-06.3 | Version history | Old and new versions of a proposal are both preserved and viewable (v1, v2, etc.) | **Medium** |

#### FR-07: Appeal System

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-07.1 | Submit appeal | Appeal form with justification text for a rejected proposal | **Medium** |
| FR-07.2 | Track appeal status | Separate status tracking for appeals: Pending Appeal, Reviewed, Final Decision | **Low** |

### 3.3 Reviewer Portal (Assigned Users Only)

#### FR-08: Assigned Proposal Dashboard

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-08.1 | View assigned proposals only | Reviewer sees only proposals specifically assigned to them (privacy/security control) | **High** |
| FR-08.2 | Full proposal detail view | Complete proposal content and attachments viewable in a dedicated read page | **High** |
| FR-08.3 | AI proposal summarizer | AI-powered (agentic) feature that automatically generates a 3–4 line summary of each proposal for the reviewer, shown at the top of the detail view; helps the reviewer quickly grasp the proposal's core idea before reading in full | **Medium** |

#### FR-09: Review Decision

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-09.1 | Decision options | Accept / Revision Needed / Deny — one of three required per review | **High** |
| FR-09.2 | Mandatory comment | Written comment/justification required with every decision | **High** |
| FR-09.3 | Scoring rubric (future) | Optional rating of criteria such as Feasibility, Budget, Innovation (1–5 scale) | **Low** |

#### FR-10: Notifications

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-10.1 | Notify researcher on decision | Automatic notification sent once a review decision is submitted | **Medium** |
| FR-10.2 | Notify reviewer on assignment | Automatic notification sent when a new proposal is assigned | **Medium** |

### 3.4 KURIC Officer (Admin) Portal

#### FR-11: Reviewer Assignment

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-11.1 | Assign reviewer | Select a reviewer from a dropdown for each pending proposal | **High** |
| FR-11.2 | Reassign reviewer | Change the assigned reviewer if needed (e.g. reviewer unavailable) | **Medium** |
| FR-11.3 | AI reviewer-matching agent | AI-powered (agentic) feature that reads the proposal's topic/keywords and automatically suggests the most suitable reviewer(s) based on subject expertise; officer reviews the AI suggestion and confirms the final assignment | **Medium** |

#### FR-12: System-Wide Monitoring

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-12.1 | Proposal overview dashboard | Summary view of all proposals by status (counts/mini dashboard) | **High** |
| FR-12.2 | Filter & search proposals | Filter by status, date, or researcher name | **Medium** |
| FR-12.3 | Export report | Export proposal data to CSV/Excel for reporting | **Low** |
| FR-12.4 | AI automated report generator | AI-powered (agentic) feature that automatically compiles a periodic (e.g. monthly/sprint-end) report summarizing proposal counts, acceptance/rejection trends, and department-wise activity, without officer manually compiling the data | **Medium** |

#### FR-13: Content Management (CMS)

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-13.1 | Events CRUD | List page with search/filter; Add/Edit form (title, date, time, location, description, banner image); Delete with confirmation prompt | **High** |
| FR-13.2 | News CRUD | List page; Add/Edit form (title, content, thumbnail image); Delete with confirmation prompt | **High** |
| FR-13.3 | Publications CRUD | List page; Add/Edit form (title, author(s), year, abstract, PDF upload); Delete with confirmation prompt | **High** |
| FR-13.4 | Rich text editor | Toolbar with bold, italic, links, lists, headings, and inline image insertion for Event/News content | **Medium** |
| FR-13.5 | Image upload | Separate banner/thumbnail upload per item; images stored on server/cloud storage, URL saved in database | **Medium** |
| FR-13.6 | Homepage settings | Single settings page to update statistics counters and hero banner image/tagline | **Medium** |

#### FR-14: Appeal Resolution

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-14.1 | Appeal review interface | View researcher's appeal justification alongside original reviewer comment | **Medium** |
| FR-14.2 | Final decision | Officer can override reviewer decision or uphold rejection | **Medium** |
| FR-14.3 | Notify researcher of outcome | Automatic notification sent once appeal is resolved | **Medium** |

#### FR-15: User & Account Management

| ID | Requirement | Description / Sub-functionality | Priority |
|---|---|---|---|
| FR-15.1 | View all users | List of all Researcher and Reviewer accounts | **Medium** |
| FR-15.2 | Assign/revoke reviewer role | Grant or remove Reviewer permission for a registered user | **Medium** |
| FR-15.3 | Activate/deactivate account | Disable an account in case of misuse | **Low** |
| FR-15.4 | Admin password reset | Reset a locked-out user's password on their behalf | **Low** |

### Priority Legend

- **High** — Core MVP feature; must be completed within the 6-week project timeline.
- **Medium** — Important but can follow shortly after MVP if time is limited.
- **Low** — Nice-to-have enhancement; can be listed as Future Scope if time runs short.

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Role-based access control; passwords stored securely (hashed). |
| Usability | Responsive design; simple, intuitive dashboards for each role. |
| Performance | Pages should load within 3 seconds under normal conditions. |
| Reliability | Proposal data must not be lost; all actions logged for accountability. |
| Maintainability | Codebase organized and version-controlled for future updates. |

---

## 5. AI Feature Specification

This appendix provides a detailed specification for the four Agentic AI-powered features integrated into the functional requirements above (FR-02.3, FR-08.3, FR-11.3, and FR-12.4). For each feature, this document describes its placement on the website, the UI elements involved, the screen space it occupies, and the step-by-step operational workflow — from user action to AI response.

*These features are described as "agentic" because, beyond simply answering a question, each one performs part of a multi-step task with limited human input — retrieving data, generating structured output, or ranking options — rather than only responding conversationally.*

### 5.1 AI Virtual Assistant (Chatbot)

**Related Requirement:** FR-02.3 — Public Website Module

**Placement on the Website**
- A floating circular chat icon (approximately 50×50 px) fixed at the bottom-right corner of every public-facing page (Home, About, Research, Publications, Events, Contact).
- Clicking the icon opens a chat panel (approximately 350×450 px) that overlays the corner of the screen without covering the full page.

**UI Elements**
- Header bar: "KURIC Assistant" title with a close (✕) button.
- Message area: scrollable chat history showing user and assistant messages as chat bubbles.
- Input row: text field with a Send button.
- Optional: 3–4 quick-question buttons shown on first open (e.g. "How do I submit a proposal?", "What are KURIC's research areas?").

**Operational Workflow**
1. The visitor types a question into the input field and presses Send.
2. The frontend sends the question to a dedicated backend endpoint (e.g. `/api/chatbot`).
3. The backend retrieves relevant content from the KURIC database (research areas, FAQs, publications, contact details) using a Retrieval-Augmented Generation (RAG) approach.
4. The retrieved content, together with the visitor's question, is sent to the Claude API.
5. Claude generates a natural-language answer, which is returned to the frontend and displayed as a chat bubble.

### 5.2 AI Proposal Summarizer

**Related Requirement:** FR-08.3 — Reviewer Portal

**Placement on the Website**
- Displayed at the top of the Proposal Detail page, which a reviewer opens from their Assigned Proposal Dashboard.
- Shown as a distinct highlighted card (approximately 100–150 px tall) above the full proposal content, clearly labelled "AI-Generated Summary" for transparency.

**UI Elements**
- A shaded summary card containing 3–4 sentences of plain-text summary.
- An optional "Regenerate" button, shown only if the proposal has been revised and resubmitted.

**Operational Workflow**
1. When a reviewer opens a proposal for the first time, the backend sends the proposal's title, abstract, and objectives to the Claude API.
2. Claude returns a concise 3–4 line summary of the proposal.
3. The summary is saved to the database (in an `ai_summary` field) so it does not need to be regenerated on every page visit, reducing API cost and load time.
4. On subsequent visits, the stored summary is displayed directly.
5. If the researcher revises and resubmits the proposal, the reviewer can click "Regenerate" to refresh the summary for the new version.

### 5.3 AI Reviewer-Matching Agent

**Related Requirement:** FR-11.3 — KURIC Officer (Admin) Portal

**Placement on the Website**
- Displayed on the officer's "Assign Reviewer" page, directly above the manual reviewer-selection dropdown.
- Shown as an "AI Suggestion" panel (approximately 150–200 px tall) containing 2–3 small reviewer cards placed side by side.

**UI Elements**
- Each suggested reviewer card shows: reviewer name, a match percentage, and a short reason (e.g. "Expertise in ICT & AI").
- Clicking a card auto-selects that reviewer in the assignment dropdown; the officer may also ignore the suggestion and choose manually.

**Operational Workflow**
1. When the officer opens the assignment page for a pending proposal, the backend sends the proposal's topic/keywords together with all reviewers' expertise profiles to the Claude API.
2. Claude ranks the reviewers by relevance to the proposal topic and returns the top matches with a brief justification for each.
3. The ranked suggestions are displayed as cards; the final assignment decision always remains with the officer.

**Dependency Note**
*This feature requires reviewer profiles to include an "Area of Expertise" field, captured during reviewer registration. This field should be added to FR-03 (Registration & Login) if not already present.*

### 5.4 AI Automated Report Generator

**Related Requirement:** FR-12.4 — KURIC Officer (Admin) Portal

**Placement on the Website**
- A dedicated "Reports" tab within the officer dashboard.
- Top of page: a date-range selector (e.g. This Month / This Sprint / Custom Range) with a "Generate AI Report" button.
- Below: the generated report is displayed as full-width formatted text (paragraphs with bullet highlights), followed by a "Download as PDF" button.

**UI Elements**
- Date-range selector control.
- "Generate AI Report" action button.
- Report display area (formatted narrative text).
- "Download as PDF" export button.

**Operational Workflow**
1. The officer selects a date range and clicks "Generate AI Report."
2. The backend queries the database for raw statistics within that range: total proposals, accepted/rejected/pending counts, and department-wise distribution.
3. This structured data is sent to the Claude API with a prompt requesting a narrative summary that highlights trends (e.g. "Environment-related proposals increased 30% this month"), not just raw numbers.
4. Claude returns a written report, displayed to the officer.
5. The officer may download the report as a PDF for sharing with KURIC authorities.

### 5.5 Technical Integration Summary

All four AI features are powered by the Claude API and are consolidated into a single, dedicated backend service to keep the codebase organized and to simplify adding further AI features in the future.

| Application Layer Service | Role |
|---|---|
| Auth Service | Login and role verification (existing) |
| Proposal Service | Proposal submission and review workflow (existing) |
| Content Service | Public content management (existing) |
| AI Service (new) | Handles all Claude API communication for the chatbot, summarizer, reviewer-matching agent, and report generator |

| Feature | Requirement ID | Priority |
|---|---|---|
| AI Virtual Assistant (Chatbot) | FR-02.3 | Medium |
| AI Proposal Summarizer | FR-08.3 | Medium |
| AI Reviewer-Matching Agent | FR-11.3 | Medium |
| AI Automated Report Generator | FR-12.4 | Medium |

*All four features are classified as Medium priority: they are not required for the Minimum Viable Product (the core submit → review → decision workflow) but are planned enhancements within the 6-week project scope, to be implemented after core High-priority requirements are complete.*

---

## 6. System Architecture Overview

![KURIC System Architecture](kuric_system_architecture_hd.png)

The KURIC Web Portal follows a three-layer architecture:

- **Client Layer** — web browser interface used by all four user types; each role sees a different view/dashboard based on login.
- **Application Layer** — backend server (Node.js/Express) exposing REST APIs through three services: **Auth Service** (login & role verification), **Proposal Service** (submission & review workflow), and **Content Service** (public content management), plus a dedicated **AI Service** for all four AI features.
- **Data Layer** — a database (MongoDB/PostgreSQL) for users, proposals, and content, plus file storage for uploaded documents (e.g. proposal PDFs).

The client sends HTTPS requests to the application layer, which queries the database and returns the response. This separation lets frontend and backend be developed independently and communicate only through APIs. Every AI output (a summary, a match, or a report) passes through human review before any final decision is recorded — AI assists, it never decides alone.

---

## 7. KURIC Project Timeline — 6 Weeks

| Week | Focus | Key Tasks |
|---|---|---|
| **Week 1** | Initiation & SRS | Define scope/objectives/roles · Draft SRS document (with role-based requirements) · Set up GitHub repo + README + CONTRIBUTING guidelines |
| **Week 2** | Design & Planning | Create wireframes for all 4 roles (Public site, Researcher dashboard, Reviewer dashboard, Officer admin panel) · Design ER Diagram (Users, Proposals, Reviews, Content tables) · System Architecture · Set up GitHub Projects board |
| **Week 3–4** | Development Sprint 1 | Build Auth module (role-based login/register using JWT) · Build static public website pages (Home, About, Research, Contact) · Navigation/layout · Build Researcher's proposal submission form (first core feature) · Write unit tests · First round of PR reviews |
| **Week 5–6** | Development Sprint 2 | Build Reviewer dashboard (view assigned proposals, Accept/Revise/Deny + comments) · Build Officer admin panel (assign reviewers, manage content — events/news/publications, handle appeals) · Connect frontend to backend APIs · Notification system · Final testing & sprint retrospective |

---

## 8. Technology Summary

The system will be built using a standard modern web development stack, chosen for reliability, community support, and ease of collaborative development between two team members:

- **Frontend:** React (or Next.js) with Tailwind CSS for a responsive, role-based user interface.
- **Backend:** Node.js with Express.js, providing REST APIs for authentication, proposal workflow, and content management.
- **Database:** MongoDB (or PostgreSQL) to store users, proposals, reviews, and site content.
- **Authentication:** JWT-based role authentication (Public / Researcher / Reviewer / Officer).
- **Version Control & Collaboration:** GitHub, for source code management, task tracking (Projects board), and Pull Request based review between the two team members.
- **AI-Assisted Development:** Claude and GitHub Copilot used for requirement drafting, documentation, code scaffolding, and test generation throughout the project.

---

## 9. Acknowledgement

We would like to thank our course instructor for the guidance and the opportunity to design a real, practical system for Khulna University Research and Innovation Center. We studied some previous websites on RIC of BUET (RISE), KUET and MIT. Then with the help of Claude, we organized our requirements for KURIC.

GitHub is used as the central platform for this project's version control and team collaboration. Since we are a two-member team, GitHub allows us to work on different modules in parallel using separate branches, track every change through commit history, and review each other's code through Pull Requests before merging — ensuring that both members remain synchronized on the same, error-free codebase throughout development.

In addition, AI tools (Claude, ChatGPT) were used responsibly to accelerate documentation, while all core design decisions, requirements, and final implementation remain the work and understanding of the project team.
