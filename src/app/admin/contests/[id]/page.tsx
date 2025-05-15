'use client';

import { useEffect, useState, use } from 'react';

const MEMBER_COUNTRIES = ['FR', 'DE', 'IT', 'ES', 'GB'];

export default function AdminTop10Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: contestId } = use(params);
  const [contestants, setContestants] = useState<{ id: string; country: string }[]>([]);
  const [host, setHost] = useState<string | null>(null);
  const [top10, setTop10] = useState<(string | null)[]>(Array(10).fill(null));
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [contestantsRes, contestRes, rankRes] = await Promise.all([
        fetch(`/api/contestants?contest_id=${contestId}`),
        fetch(`/api/contests/${contestId}`),
        fetch(`/api/rank?contest_id=${contestId}`)
      ]);

      const contestantsData = await contestantsRes.json();
      const contestData = await contestRes.json();
      const rankData = await rankRes.json();

      const known = new Set(contestantsData.map((c: any) => c.country));
      const required = [...MEMBER_COUNTRIES];
      if (contestData.host) {
        required.push(contestData.host);
      }

      for (const code of required) {
        if (!known.has(code)) {
          contestantsData.push({ id: `__${code}`, country: code });
        }
      }

      contestantsData.sort((a: any, b: any) => a.country.localeCompare(b.country));
      setHost(contestData.host);
      setContestants(contestantsData);

      if (Array.isArray(rankData?.ranking)) {
        const filled = Array(10).fill(null).map((_, i) => rankData.ranking[i] || null);
        setTop10(filled);
      }
    };
    load();
  }, [contestId]);

  const setRank = (targetIndex: number) => {
    if (!selected) return;

    setTop10(prev => {
      const oldIndex = prev.findIndex(id => id === selected);
      const updated = [...prev];
      if (oldIndex !== -1) updated[oldIndex] = null;

      const shiftDown = (arr: (string | null)[], start: number): (string | null)[] => {
        const out = [...arr];
        let moving = selected;
        for (let i = start; i < 10; i++) {
          const current = out[i];
          out[i] = moving;
          moving = current;
          if (!moving) break;
        }
        return out;
      };

      return shiftDown(updated, targetIndex);
    });

    setSelected(null);
  };

  const top10Contestants = top10.map(id => contestants.find(c => c.id === id));
  const remaining = contestants.filter(c => !top10.includes(c.id));

  return (
    <div style={{ padding: 24 }}>
      <h1>Top 10 — Contest {contestId}</h1>

      <ol>
        {top10Contestants.map((c, i) => (
          <li
            key={i}
            onClick={() => c && setSelected(c.id)}
            style={{
              marginBottom: 4,
              cursor: c ? 'pointer' : 'default',
              background: selected === c?.id ? '#eef' : 'transparent'
            }}
          >
            {c ? c.country : <span style={{ color: '#888' }}>—</span>}
          </li>
        ))}
      </ol>

      {selected && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <strong>{selected} →</strong>
          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              onClick={() => setRank(i)}
              style={{ marginLeft: 4 }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <hr style={{ margin: '24px 0' }} />

      <ul>
        {remaining.map(c => (
          <li
            key={c.id}
            style={{ cursor: 'pointer', marginBottom: 4 }}
            onClick={() => setSelected(c.id)}
          >
            {c.country}
          </li>
        ))}
      </ul>

      <button
        onClick={async () => {
          const res = await fetch(`/api/rank`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contest_id: contestId,
              ranking: top10.filter(Boolean),
            })
          });

          const data = await res.json();
          if (!res.ok) alert(data.error || 'Error saving');
          else alert('Top 10 saved');
        }}
        style={{ marginTop: 24 }}
      >
        Save Ranking
      </button>
    </div>
  );
}
