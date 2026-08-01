# Gradigo

## Description

The transition from university to full-time employment introduces financial responsibilities that many graduates are not fully prepared for. Concepts such as taxation, budgeting, pension contributions, and regional cost-of-living differences can be difficult to interpret, particularly for individuals managing their finances independently for the first time. Although information on these topics is widely available, it is often fragmented and not presented in a way that supports practical decision-making. This project proposes the development of Gradigo, a web-based platform designed to support early-career professionals in navigating these challenges. The platform integrates financial simulations, budgeting tools, and educational resources within a single interface, providing users with a structured way to engage with their finances.

## Team

The project is delivered by Team Sharkey, consisting of the following members: 

- Hassaan Alvi (Project Manager | DevOps Lead)
- Abdul Moiz Malik (Lead Backend Engineer | Solutions Architect)
- Mohammad Jafari-Fini (Full-stack Engineer | AI Integration Specialist)
- Mohamed Kordofani (Lead Backend Engineer | Solutions Architect |  DevOps Engineer (Deployment Strategies))
- Awab Ahmed  (Frontend Engineer | QA Tester)
- Sai Raghavan Commandur (Lead Frontend Engineer | Solutions Architect | QA Tester)

Each team member contributes has responsibilities are distributed based on technical focus areas such as frontend development, backend development, system architecture, documentation and infrastructure. 

## Tech Stack

### Backend

* Django 5
* Django REST Framework
* MySQL (production/dev)
* SQLite (tests)
* JWT Authentication

### Frontend

* React
* TypeScript
* Node.js

### DevOps / Deployment

* GitLab CI/CD
* Caddy reverse proxy
* Linux VM deployment

---

## Features

* User authentication and JWT login
* Salary Simulator
* Budgeting tools
* Pension calculators
* Move-out planning tools
* Learning hub (articles, videos, quizzes/questions)
* AI chatbot integrations
* Dashboard metrics and progress tracking
* REST API endpoints

---

## Repository Structure

```text
team-sharkey/
├── Backend/
├── Frontend/first-job-navigator/
├── .gitlab-ci.yml
├── Caddyfile
└── README.md
```

---

## Local Setup

### 1. Clone Repository

```bash
git clone <repo-url>
cd team-sharkey
```

### 2. Backend Setup

```bash
cd Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000
```

### 3. Frontend Setup

```bash
cd Frontend/first-job-navigator
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

---

## Environment Variables

Create `Backend/.env` using `.env.example`.

Example:

```env
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000
DB_NAME=first_job_navigator
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=3306
GROQ_API_KEY=
APIFY_API_KEY=
```

---

## Running Tests

### Backend

```bash
cd Backend
pytest
```

### Frontend

```bash
cd Frontend/first-job-navigator
npm test
```

---

## Deployment (Linux VM)

### Install dependencies

```bash
sudo apt update
sudo apt install git python3-pip python3-venv nodejs npm caddy -y
```

### Run services

* Django/Gunicorn on port `8000`
* Frontend on port `3000`
* Caddy on port `80`

Visit:

```text
http://<vm-ip>
```

---

## API Examples

```text
GET  /api/learning/articles/
GET  /api/learning/videos/
GET  /api/learning/questions/?category=tax&difficulty=hard
POST /api/learning/articles/<id>/complete/
POST /api/learning/quizzes/<id>/submit/
GET  /api/learning/dashboard/
```

---

## CI/CD

GitLab pipeline stages:

* Build
* Lint
* Test
* Deploy

---

## Notes

* `.env` is gitignored and should never be committed.
* Use `.env.example` as the template.
* Optional third-party API features may require keys.


## Credits

Thank you to [ESBF](https://esbf.org.uk/about-esbf/) & Andrew Crossan for hosting this competition. Special thanks to Dr Dany Varghese for being our project sponsor and reviewing our project at every stage when we went from concept -> production.
