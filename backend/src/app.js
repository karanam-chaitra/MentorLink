const express = require('express');
const cors = require('cors');
const axios = require('axios');
const client = require('prom-client');
const { validateProfilePayload, canAcceptNewRequest } = require('./services/mentorService');

const app = express();
app.use(cors());
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'mentorlink_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2]
});
const httpErrorCounter = new client.Counter({
  name: 'mentorlink_http_errors_total',
  help: 'Total HTTP 4xx and 5xx errors',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestDuration);
register.registerMetric(httpErrorCounter);

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    end({ method: req.method, route, status_code: res.statusCode });
    if (res.statusCode >= 400) {
      httpErrorCounter.inc({ method: req.method, route, status_code: res.statusCode });
    }
  });
  next();
});

const store = {
  students: [],
  mentors: [],
  requests: []
};

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mentorlink-backend',
    timestamp: new Date().toISOString(),
    counts: {
      students: store.students.length,
      mentors: store.mentors.length,
      requests: store.requests.length
    }
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.post('/api/students', (req, res) => {
  const errors = validateProfilePayload(req.body, 'student');
  if (errors.length > 0) return res.status(400).json({ errors });
  const student = { id: `stu_${store.students.length + 1}`, ...req.body };
  store.students.push(student);
  return res.status(201).json(student);
});

app.get('/api/students', (req, res) => res.json(store.students));

app.post('/api/mentors', (req, res) => {
  const errors = validateProfilePayload(req.body, 'mentor');
  if (errors.length > 0) return res.status(400).json({ errors });
  const mentor = {
    id: `men_${store.mentors.length + 1}`,
    activeRequestsCount: 0,
    exposureCount: 0,
    ...req.body
  };
  store.mentors.push(mentor);
  return res.status(201).json(mentor);
});

app.get('/api/mentors', (req, res) => res.json(store.mentors));

app.post('/api/requests', (req, res) => {
  const { studentId, mentorId, topic } = req.body;
  const student = store.students.find((s) => s.id === studentId);
  const mentor = store.mentors.find((m) => m.id === mentorId);

  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
  if (!topic || topic.trim().length < 3) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const capacityCheck = canAcceptNewRequest(mentor);
  if (!capacityCheck.allowed) {
    return res.status(409).json({ error: capacityCheck.reason });
  }

  mentor.activeRequestsCount += 1;
  const requestObj = {
    id: `req_${store.requests.length + 1}`,
    studentId,
    mentorId,
    topic,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  store.requests.push(requestObj);
  return res.status(201).json(requestObj);
});

app.get('/api/requests', (req, res) => res.json(store.requests));

app.post('/api/recommendations', async (req, res) => {
  const { studentId, topK = 3 } = req.body;
  const student = store.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const mlUrl = process.env.ML_SERVICE_URL || 'http://ml-service:8000/recommend';
  try {
    const response = await axios.post(mlUrl, {
      student: {
        interests: student.interests,
        goals: student.goals
      },
      mentors: store.mentors.map((m) => ({
        id: m.id,
        expertise: m.expertise,
        bio: m.bio,
        maxCapacity: m.maxCapacity,
        activeRequestsCount: m.activeRequestsCount,
        exposureCount: m.exposureCount
      })),
      top_k: topK
    });
    return res.json(response.data);
  } catch (err) {
    return res.status(502).json({ error: 'ML recommendation service unavailable', details: err.message });
  }
});

module.exports = { app, store };
