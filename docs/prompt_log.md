# AI-Usage & Prompt Log (Phases 1–5)

| ID | Phase | Tool | Prompt Summary (PII Masked) | Verification & Corrections | Decision |
|---|---|---|---|---|---|
| P1 | Phase 1 | ChatGPT | Draft SRS for MentorLink covering profile creation, requests, and embedding recommendation | Removed ambiguous "fast matching" line; added measurable latency (<500ms) and capacity rule | Modified |
| P2 | Phase 2 | ChatGPT | Generate 20 user stories with acceptance criteria and story point estimates | Adjusted Sprint 2 story points after team planning poker; added coordinator fairness story | Modified |
| P3 | Phase 3 | Copilot | Generate FastAPI `sentence-transformers` recommender endpoint | Added TF-IDF fallback for offline CI and logarithmic fair-exposure penalty | Modified |
| P4 | Phase 4 | ChatGPT | Generate Jest & PyTest test cases including mentor capacity boundary | Added explicit HTTP 409 conflict test when `activeRequestsCount == maxCapacity` | Accepted |
| P5 | Phase 5 | ChatGPT | Review `recommender.py` and `mentorService.js` for security and bias | Added `sanitizeForLogs()` to strip student/mentor emails before logging | Modified |
