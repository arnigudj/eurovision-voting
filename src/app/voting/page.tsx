'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const MEMBER_COUNTRIES = ['FR', 'DE', 'IT', 'ES', 'GB'];

export default function VotingPage() {
  const [nickname, setNickname] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contestants, setContestants] = useState<{ id: string; country: string }[]>([]);
  const [host, setHost] = useState<string | null>(null);
  const [top10, setTop10] = useState<(string | null)[]>(Array(10).fill(null));
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname');
    if (!storedNickname) {
      router.push('/');
      return;
    }
    setNickname(storedNickname);

    const load = async () => {
      const [userRes, contestRes, contestantsRes, voteRes] = await Promise.all([
        fetch(`/api/users/${storedNickname}`),
        fetch(`/api/contests/active`),
        fetch(`/api/contestants/active`),
        fetch(`/api/votes?nickname=${storedNickname}`)
      ]);

      const user = await userRes.json();
      const contest = await contestRes.json();
      const data = await contestantsRes.json();
      const voteData = await voteRes.json();

      setImageUrl(user.image_url);
      setHost(contest.host);

      const known = new Set(data.map((c: any) => c.country));
      const required = [...MEMBER_COUNTRIES];
      if (contest.host) required.push(contest.host);

      for (const code of required) {
        if (!known.has(code)) {
          data.push({ id: `__${code}`, country: code });
        }
      }

      data.sort((a: any, b: any) => a.country.localeCompare(b.country));
      setContestants(data);

      if (Array.isArray(voteData?.ranking)) {
        const filled = Array(10).fill(null).map((_, i) => voteData.ranking[i] || null);
        setTop10(filled);
      }
    };

    load();
  }, [router]);

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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {imageUrl && <img
          src={imageUrl}
          alt="User selfie"
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginRight: 16 }}
        />}
        <h2>{nickname}</h2>
      </div>

      <h3>My Top 10</h3>

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
          const res = await fetch(`/api/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nickname,
              ranking: top10.filter(Boolean),
            })
          });

          const data = await res.json();
          if (!res.ok) alert(data.error || 'Error saving vote');
          else alert('Your vote has been saved!');
        }}
        style={{ marginTop: 24 }}
      >
        Vote
      </button>
    </div>
  );
}