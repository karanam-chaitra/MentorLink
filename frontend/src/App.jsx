import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  const [studentId, setStudentId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');

  async function handleCreateStudent(e) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        department: 'CSE',
        year: 2,
        interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
        goals
      })
    });
    const data = await res.json();
    if (res.ok) {
      setStudentId(data.id);
      setStatusMsg(`Profile created! Student ID: ${data.id}`);
    } else {
      setStatusMsg(`Error: ${(data.errors || [data.error]).join(', ')}`);
    }
  }

  async function handleGetRecommendations() {
    if (!studentId) return;
    const res = await fetch(`${API_BASE}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, topK: 3 })
    });
    const data = await res.json();
    setRecommendations(data.recommendations || []);
  }

  async function handleSendRequest(mentorId) {
    const res = await fetch(`${API_BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, mentorId, topic: goals || 'General Mentorship' })
    });
    const data = await res.json();
    setStatusMsg(res.ok ? `Request sent to ${mentorId}` : `Blocked: ${data.error}`);
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>MentorLink: Student Mentor Matching</h1>
      <form onSubmit={handleCreateStudent} style={{ display: 'grid', gap: 10 }}>
        <input id="student-name" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input id="student-email" placeholder="College Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input id="student-interests" placeholder="Interests (comma-separated, e.g. ML, React)" value={interests} onChange={(e) => setInterests(e.target.value)} required />
        <textarea id="student-goals" placeholder="Your mentorship goals" value={goals} onChange={(e) => setGoals(e.target.value)} required />
        <button id="create-profile-btn" type="submit">Create Student Profile</button>
      </form>

      {statusMsg && <p id="status-message">{statusMsg}</p>}

      {studentId && (
        <div style={{ marginTop: 20 }}>
          <button id="get-recs-btn" onClick={handleGetRecommendations}>Get Top-3 Mentor Recommendations</button>
          <ul>
            {recommendations.map((rec) => (
              <li key={rec.mentorId}>
                <strong>{rec.mentorId}</strong> — Score: {rec.finalScore} (Remaining Slots: {rec.remainingCapacity})
                <button onClick={() => handleSendRequest(rec.mentorId)} style={{ marginLeft: 10 }}>Request Mentor</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
