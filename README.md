# KURIC Web Portal

Official web portal for the **Khulna University Research and Innovation Center (KURIC)** — a combined public information website and research-proposal management system.

Full requirements are documented in [`docs/KURIC_SRS_v1.docx`](docs/KURIC_SRS_v1.docx).

## Team

| Name | Student ID | Responsibility |
|---|---|---|
| Hadidur Rahman Jion | 220215 | Full-stack development, backend & database design |
| Sadia Afrin Tamanna | 220240 | Full-stack development, UI/UX & documentation |

**Supervised by:** Engr. Prof. Dr. Kazi Masudul Alam, Computer Science and Engineering Discipline, Khulna University

## Project Overview

KURIC currently has no online presence. This project builds a single, unified platform that:

- Presents general information about KURIC to the public (research, publications, events, news).
- Provides a role-based interactive workflow for **research proposal submission and review**.

## User Roles

| Role | Access | Purpose |
|---|---|---|
| **Public / Visitor** | No login required | Browse general KURIC information, research, events, and news |
| **Researcher** (Teacher/Student) | Registered login | Submit and track research proposals |
| **Reviewer** | Assigned login | Evaluate proposals and give decisions/suggestions |
| **KURIC Officer** (Admin) | Admin login | Manage content, users, proposals, and appeals |

## Proposal Workflow

```
Researcher submits proposal
        ↓
Reviewer evaluates
        ↓
Decision & feedback sent (Accept / Revise / Deny)
        ↓
KURIC Officer manages record & publishes updates
```

## System Architecture

The portal follows a three-layer architecture:

- **Client Layer** — web browser interface used by all four user types; each role sees a different view/dashboard based on login.
- **Application Layer** — backend server (Node.js/Express) exposing REST APIs through three services: **Auth Service** (login & role verification), **Proposal Service** (submission & review workflow), and **Content Service** (public content management).
- **Data Layer** — a database (MongoDB/PostgreSQL) for users, proposals, and content, plus file storage for uploaded documents (e.g. proposal PDFs).

The client sends HTTPS requests to the application layer, which queries the database and returns the response. This separation lets frontend and backend be developed independently and communicate only through APIs.

## Project Timeline (6 Weeks)

| Week | Focus | Key Tasks |
|---|---|---|
| **Week 1** | Initiation & SRS | Define scope/objectives/roles · Draft SRS document (role-based requirements) · Set up GitHub repo + README + CONTRIBUTING guidelines |
| **Week 2** | Design & Planning | Wireframes for all 4 roles · ER Diagram (Users, Proposals, Reviews, Content) · System Architecture · GitHub Projects board |
| **Week 3–4** | Development Sprint 1 | Auth module (JWT, role-based) · Static public pages (Home, About, Research, Contact) · Navigation/layout · Researcher's proposal submission form · Unit tests · First PR review round |
| **Week 5–6** | Development Sprint 2 | Reviewer dashboard · Officer admin panel (assign reviewers, manage content, handle appeals) · Frontend–backend API integration · Notification system · Final testing & sprint retrospective |

## Tech Stack

- **Frontend:** React (or Next.js), Tailwind CSS
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MongoDB (or PostgreSQL)
- **Authentication:** JWT-based, role-based access control
- **Version Control:** GitHub (branching + Pull Requests between the two team members)
- **AI-Assisted Development:** Claude & GitHub Copilot for documentation, scaffolding, and testing support

## Getting Started

```bash
git clone https://github.com/<org>/kuric-web-portal.git
cd kuric-web-portal
# setup instructions to be added once project scaffolding is created
```

## Acknowledgement

We would like to thank our course instructor, Engr. Prof. Dr. Kazi Masudul Alam, for the guidance and the opportunity to design a real, practical system for the Khulna University Research and Innovation Center. We studied a few existing research/innovation center websites — BUET RISE, KUET, and MIT — and used Claude to help organize our findings into structured requirements for KURIC.

GitHub is used as the central platform for this project's version control and collaboration. As a two-member team, GitHub lets us work on different modules in parallel using separate branches, track every change through commit history, and review each other's code through Pull Requests before merging — keeping both members synchronized on the same, error-free codebase throughout development.

AI tools (Claude, ChatGPT) were used responsibly to accelerate documentation, while all core design decisions, requirements, and final implementation remain the work and understanding of the project team.

## License

Developed for academic purposes under Khulna University.
