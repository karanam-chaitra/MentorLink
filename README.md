# P25 MentorLink: Student Mentor Matching

**Domain:** Education | **Stack:** Node.js (Express), React, MongoDB, Python (`sentence-transformers`), Docker, GitHub Actions, Jenkins, Prometheus & Grafana.

## Overview
MentorLink connects junior students with senior mentors based on semantic similarity between mentee goals/interests and mentor profiles. It enforces mentor request capacity limits, applies fair-exposure re-ranking to avoid popularity bias, and masks sensitive personal profile data in logs and AI prompts.

## Architecture
- **Frontend (`frontend/`)**: React SPA for Students, Mentors, and Coordinators.
- **Backend API (`backend/`)**: Node.js Express + MongoDB managing student/mentor profiles, mentorship requests (with strict capacity enforcement), sessions, `/health`, and Prometheus `/metrics`.
- **ML Recommendation Service (`ml-service/`)**: Python FastAPI service using `sentence-transformers` (`all-MiniLM-L6-v2`) with cosine similarity + fair-exposure re-ranking to prevent over-recommending popular mentors.
- **Monitoring (`monitoring/`)**: Prometheus scraping `/metrics` + Grafana dashboard for request latency and error tracking.
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`) and Jenkins (`Jenkinsfile`).

## Clean-Machine Quick Start (Docker Compose)
```bash
git clone <your-repo-url>
cd mentorlink-p25
docker compose up --build
```
Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000 (`GET /health`, `GET /metrics`)
- ML Recommender: http://localhost:8000 (`GET /health`, `POST /recommend`)
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (default login: `admin` / `admin`)

## Local Development & Running Tests
### Backend (Node.js)
```bash
cd backend
npm install
npm test
```

### ML Service & Python Test Suite (PyTest + Coverage)
```bash
cd ml-service
pip install -r requirements.txt
pytest --cov=. --cov-report=term-missing
```

### Selenium E2E Tests
```bash
pip install selenium webdriver-manager pytest
RUN_E2E=1 pytest tests/selenium/test_mentorlink_e2e.py
```

### Load Testing (Locust)
```bash
locust -f tests/locustfile.py --host=http://localhost:5000
```

### SonarQube Scan
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:community
sonar-scanner
```

## Success Metrics Targets
- **Recommendation Quality**: Top-3 mentor list contains an accepted mentor in >= 70% of simulated cases.
- **Test Coverage**: >= 80% on core profile, request capacity, and recommendation modules.
- **Code Quality**: Zero SonarQube blocker issues; green CI/CD pipeline.
