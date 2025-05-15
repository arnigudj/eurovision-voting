"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "../api/users/types";
import { Contest } from "../api/contests/types";
import { Contestant } from "../api/contestants/types";
import { Vote } from "../api/votes/types";
import { assignRank } from "@/lib/rank";
import { getCountryName } from "@/lib/countries";

export default function VotingPage() {
  const [nickname, setNickname] = useState("");
  const [user, setUser] = useState<User>();
  const [contest, setContest] = useState<Contest>();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [top10, setTop10] = useState<(string | null)[]>(Array(10).fill(null));
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    if (!storedNickname) {
      router.push("/");
      return;
    }
    setNickname(storedNickname);

    const load = async () => {
      const [userRes, contestRes, contestantsRes, voteRes] = await Promise.all([
        fetch(`/api/users/${storedNickname}`),
        fetch(`/api/contests/active`),
        fetch(`/api/contestants/active`),
        fetch(`/api/votes?nickname=${storedNickname}`),
      ]);

      setUser(await userRes.json());
      setContest(await contestRes.json());
      setContestants(
        ((await contestantsRes.json()) as Contestant[]).sort((a, b) =>
          a.country.localeCompare(b.country)
        )
      );
      const vote: Vote = await voteRes.json();

      if (Array.isArray(vote?.ranking)) {
        const filled = Array(10)
          .fill(null)
          .map((_, i) => vote.ranking[i] || null);
        setTop10(filled);
      }
    };

    load();
  }, [router]);

  const setRank = (targetIndex: number) => {
    if (!selected) return;
    setTop10((prev) => assignRank(prev, selected, targetIndex));
    setSelected(null);
  };

  const top10Contestants = top10.map((id) =>
    contestants.find((c) => c.id === id)
  );
  const remaining = contestants.filter((c) => !top10.includes(c.id));

  return (
    <div style={{ padding: 24 }}>
      <h1>{contest?.id}</h1>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        {user?.image_url && (
          <Image
            src={user?.image_url}
            alt="User selfie"
            width={80}
            height={80}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: 16,
            }}
          />
        )}
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
              cursor: c ? "pointer" : "default",
              background: selected === c?.id ? "#eef" : "transparent",
            }}
          >
            {c ? (
              getCountryName(c.country)
            ) : (
              <span style={{ color: "#888" }}>—</span>
            )}
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

      <hr style={{ margin: "24px 0" }} />

      <ul>
        {remaining.map((c) => (
          <li
            key={c.id}
            style={{ cursor: "pointer", marginBottom: 4 }}
            onClick={() => setSelected(c.id)}
          >
            {c.country}
          </li>
        ))}
      </ul>

      <button
        onClick={async () => {
          const res = await fetch(`/api/votes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nickname,
              ranking: top10.filter(Boolean),
            }),
          });

          const data = await res.json();
          if (!res.ok) alert(data.error || "Error saving vote");
          else alert("Your vote has been saved!");
        }}
        style={{ marginTop: 24 }}
      >
        Vote
      </button>
    </div>
  );
}
