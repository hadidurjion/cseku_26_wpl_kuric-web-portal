# KURIC Web Portal

Official web portal for the **Khulna University Research and Innovation Center (KURIC)** — a combined public information website and research-proposal management system.

## Team

| Name | Student ID |
|---|---|
| Hadidur Rahman Jion | 220215 |
| Sadia Afrin Tamanna | 220240 |

## Project Overview

KURIC currently has no online presence. This project delivers a single, unified platform that:

- Presents general information about KURIC to the public (research, publications, events, news).
- Provides a role-based interactive workflow for **research proposal submission and review**.

Full requirements are documented in [`docs/SRS.docx`](docs/SRS.docx).

## User Roles

| Role | Access | What they do |
|---|---|---|
| **Public / Visitor** | No login | Browse KURIC information, research, events, news |
| **Researcher** (Teacher/Student) | Registered login | Submit proposals, track status, respond to feedback |
| **Reviewer** | Assigned login | Evaluate assigned proposals — accept, deny, or request revision |
| **KURIC Officer** (Admin) | Admin login | Assign reviewers, manage content, handle appeals, manage accounts |

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

We would like to thank our course instructor for the guidance and the opportunity to design a real, practical system for the Khulna University Research and Innovation Center.

GitHub is used as the central platform for this project's version control and collaboration. As a two-member team, GitHub lets us work on different modules in parallel using separate branches, track every change through commit history, and review each other's code through Pull Requests before merging — keeping both members synchronized on the same codebase throughout development.

AI tools (Claude and GitHub Copilot) were used responsibly to accelerate documentation and code scaffolding, while all core design decisions and implementation remain the work of the project team.

## License

Developed for academic purposes under Khulna University.
