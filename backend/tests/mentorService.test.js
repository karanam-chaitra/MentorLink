const request = require('supertest');
const { app, store } = require('../src/app');
const {
  validateProfilePayload,
  canAcceptNewRequest,
  sanitizeForLogs
} = require('../src/services/mentorService');

beforeEach(() => {
  store.students.length = 0;
  store.mentors.length = 0;
  store.requests.length = 0;
});

describe('Unit Tests: Profile Validation & Privacy Masking', () => {
  test('validates student profile correctly', () => {
    const errors = validateProfilePayload({
      name: 'Aarav',
      email: 'aarav@college.edu',
      interests: ['AI', 'Backend'],
      goals: 'Prepare for ML internships'
    }, 'student');
    expect(errors).toEqual([]);
  });

  test('rejects invalid student profile', () => {
    const errors = validateProfilePayload({ name: 'A', email: 'bad', interests: [], goals: 'hi' }, 'student');
    expect(errors.length).toBe(4);
  });

  test('validates mentor profile and rejects zero capacity', () => {
    const errors = validateProfilePayload({
      name: 'Priya',
      email: 'priya@college.edu',
      expertise: ['Cloud'],
      maxCapacity: 0
    }, 'mentor');
    expect(errors).toContain('Mentor maxCapacity must be a positive integer');
  });

  test('masks PII in sanitizeForLogs', () => {
    const safe = sanitizeForLogs({ name: 'Aarav', email: 'aarav@college.edu', department: 'CSE' });
    expect(safe.email).toBe('***@masked');
    expect(safe.name).toBe('A***');
    expect(safe.department).toBe('CSE');
  });
});

describe('Special Rule Test (Phase 4): Mentor Capacity Enforcement', () => {
  test('unit check blocks requests once activeRequestsCount equals maxCapacity', () => {
    expect(canAcceptNewRequest({ maxCapacity: 2, activeRequestsCount: 1 }).allowed).toBe(true);
    const blocked = canAcceptNewRequest({ maxCapacity: 2, activeRequestsCount: 2 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toMatch(/capacity reached/i);
  });

  test('API returns 409 Conflict when mentor exceeds set capacity', async () => {
    const s1 = await request(app).post('/api/students').send({
      name: 'Junior One', email: 'j1@edu.in', interests: ['React'], goals: 'Build portfolio app'
    });
    const s2 = await request(app).post('/api/students').send({
      name: 'Junior Two', email: 'j2@edu.in', interests: ['Node'], goals: 'Learn REST APIs'
    });
    const m1 = await request(app).post('/api/mentors').send({
      name: 'Senior Mentor', email: 'm1@edu.in', expertise: ['React', 'Node'], bio: 'Fullstack mentor', maxCapacity: 1
    });

    const r1 = await request(app).post('/api/requests').send({
      studentId: s1.body.id, mentorId: m1.body.id, topic: 'React guidance'
    });
    expect(r1.statusCode).toBe(201);

    const r2 = await request(app).post('/api/requests').send({
      studentId: s2.body.id, mentorId: m1.body.id, topic: 'Node guidance'
    });
    expect(r2.statusCode).toBe(409);
    expect(r2.body.error).toMatch(/capacity reached/i);
  });

  test('health and metrics endpoints respond 200', async () => {
    const h = await request(app).get('/health');
    expect(h.statusCode).toBe(200);
    const m = await request(app).get('/metrics');
    expect(m.statusCode).toBe(200);
    expect(m.text).toContain('mentorlink_http_request_duration_seconds');
  });
});
