'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Contest = {
  id: string;
  description: string | null;
  active: boolean;
  created_at: string;
};

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [form, setForm] = useState({ id: '', description: '' });

  const loadContests = async () => {
    const res = await fetch('/api/contests');
    const data = await res.json();
    setContests(data);
  };

  useEffect(() => {
    loadContests();
  }, []);

  const createContest = async () => {
    const res = await fetch('/api/contests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setForm({ id: '', description: '' });
    loadContests();
  };

  const activateContest = async (id: string) => {
    const res = await fetch('/api/contests/active', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadContests();
  };

  const deleteContest = async (id: string) => {
    const confirmed = confirm(`Delete contest "${id}"?`);
    if (!confirmed) return;

    const res = await fetch('/api/contests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadContests();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Contests</h1>

      <div style={{ marginBottom: '2rem' }}>
        <input
          placeholder="Contest ID (e.g. Switzerland 2025)"
          value={form.id}
          onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <button onClick={createContest} disabled={!form.id.trim()}>
          Create
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {contests.map(c => (
          <li
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div>
              <strong><Link href={`/admin/contests/${c.id}/edit`}>{c.id}</Link></strong> – {c.description}
            </div>
            <label>
              <input
                type="checkbox"
                checked={c.active}
                onChange={() => activateContest(c.id)}
              />
              Active
            </label>
            <button onClick={() => deleteContest(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
