'use client';

import { AUTO_FINALISTS, COUNTRIES } from '@/lib/countries';
import Image from 'next/image';
import { useEffect, useState, use } from 'react';

type Contest = {
  id: string;
  description: string;
  banner_url: string | null;
  host: string | null;
};

type Contestant = {
  id: string;
  country: string;
  performer: string | null;
  song: string | null;
  image_url: string | null;
  is_final: boolean;
};

export default function EditContestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contest, setContest] = useState<Contest | null>(null);
  const [contestants, setContestants] = useState<Record<string, Contestant | null>>({});
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [contestRes, contestantsRes] = await Promise.all([
        fetch(`/api/contests/${id}`),
        fetch(`/api/contestants?contest_id=${id}`)
      ]);

      const contest = await contestRes.json();
      const data: Contestant[] = await contestantsRes.json();

      const map: Record<string, Contestant | null> = {};
      COUNTRIES.forEach(country => {
        const found = data.find(c => c.country === country.code);
        map[country.code] = found || null;
      });

      setContest(contest);
      setContestants(map);
      if (contest.banner_url) setBannerPreview(contest.banner_url);
    };

    load();
  }, [id]);

  const upsertContestant = async (country: string, update: Partial<Omit<Contestant, 'id' | 'contest_id' | 'country'>>) => {
    const existing = contestants[country];
    let res = undefined
    
    if(existing) {
      res = await fetch(`/api/contestants/${existing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
    } else {
      res = await fetch('/api/contestants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contest_id: id, country, ...update })
      });
    }

    const data = await res.json();
    if (!res.ok) alert(data.error);
    else {
      setContestants(prev => ({ ...prev, [country]: data }));
    }
  };

  const handleBannerUpload = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('id', contest!.id);
    const res = await fetch('/api/contests/banner', { method: 'POST', body: form });
    const data = await res.json();
    if (res.ok) {
      setContest(c => c && { ...c, banner_url: data.url });
      setBannerPreview(data.url);
    } else {
      alert(data.error);
    }
  };

  const handleContestantImageUpload = async (country: string, file: File) => {
    const contestant = contestants[country];
    if (!contestant) return;

    const form = new FormData();
    form.append('file', file);
    form.append('id', contestant.id);
    const res = await fetch('/api/contestants/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (res.ok) {
      setContestants(prev => ({ ...prev, [country]: { ...contestant, image_url: data.url } }));
    } else {
      alert(data.error);
    }
  };

  const updateContest = async (data: Partial<Contest>) => {
    const res = await fetch(`/api/contests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Failed to update contest');
    }
  };

  if (!contest) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit Contest: {contest.id}</h1>

      <div style={{ marginBottom: 24 }}>
        <label>Host Country:</label>
        <select
          value={contest.host || ''}
          onChange={async e => {
            const newHost = e.target.value;
            setContest(c => c && { ...c, host: newHost });
            await updateContest({ host: newHost });
          }}
        >
          <option value="">Select host</option>
          {COUNTRIES.map(country => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label>Banner:</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBannerPreview(URL.createObjectURL(file));
            handleBannerUpload(file);
          }}
        />
        {bannerPreview && <Image width={400} height={200} src={bannerPreview} alt="Preview" style={{ maxWidth: 400, marginTop: 12 }} />}
      </div>

      <h2>Contestants</h2>
      <ul style={{ padding: 0 }}>
        {COUNTRIES.map(country => {
          const c = contestants[country.code];
          return (
            <li
              key={country.code}
              style={{ marginBottom: 16, border: '1px solid #ddd', padding: 12, borderRadius: 6 }}
            >
              <strong>{country.name}</strong>

              <div>
                <input
                  placeholder="Performer"
                  defaultValue={c?.performer || ''}
                  onBlur={e => {
                    const value = e.target.value;
                    if (value && value !== c?.performer) upsertContestant(country.code, { performer: value });
                  }}
                />
                <input
                  placeholder="Song"
                  defaultValue={c?.song || ''}
                  onBlur={e => {
                    const value = e.target.value;
                    if (value && value !== c?.song) upsertContestant(country.code, { song: value });
                  }}
                />
              </div>

              {!AUTO_FINALISTS.includes(country.code) && contest.host !== country.code && (
                <label>
                  <input
                    type="checkbox"
                    checked={c?.is_final || false}
                    onChange={() => upsertContestant(country.code, { is_final: !c?.is_final })}
                  />
                  In Final
                </label>
              )}

              {c?.id && (
                <div
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handleContestantImageUpload(country.code, file);
                  }}
                  onDragOver={e => e.preventDefault()}
                  style={{ marginTop: 8, padding: 12, border: '1px dashed #aaa', background: '#f9f9f9', cursor: 'pointer' }}
                >
                  {c.image_url ? <Image width={400} height={100} src={c.image_url} alt="" style={{ maxHeight: 100 }} /> : <span>Drop performer image here</span>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}