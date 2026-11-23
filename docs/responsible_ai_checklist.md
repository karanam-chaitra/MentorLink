# Responsible AI & Ethical Development Checklist (Phase 5)

- **Bias & Fairness**: Fair-exposure logarithmic penalty (`fairness_alpha * log(1 + exposureCount)`) ensures popular mentors do not monopolize top-3 recommendations; new/less-exposed mentors receive fair visibility.
- **Privacy & Data Protection**: `sanitizeForLogs()` masks student and mentor names and email addresses before logging or prompt submission. Only non-PII fields (`interests`, `goals`, `expertise`, `bio`) are sent to the ML service.
- **Licensing**: Uses MIT/Apache-2.0 open-source libraries (`Express`, `React`, `FastAPI`, `sentence-transformers`, `scikit-learn`).
- **Transparency**: API returns `similarityScore`, `fairnessPenalty`, `finalScore`, and `remainingCapacity` so recommendations are explainable.
- **Accountability**: Human-in-the-loop review maintained across all AI-generated code and requirements; documented in `docs/prompt_log.md`.
