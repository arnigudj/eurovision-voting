"use client";

import Flag from "@/components/Flag/Flag";
import { AUTO_FINALISTS, COUNTRIES } from "@/lib/countries";
import { useEffect, useState, use } from "react";
import styles from "./page.module.scss";
import DragDropUpload from "@/components/DragDropUpload/DragDropUpload";
import Input from "@/components/Input/Input";
import Checkbox from "@/components/Checkbox/Checkbox";
import { Contest } from "@/app/api/contests/types";
import { Contestant } from "@/app/api/contestants/types";
import Link from "next/link";
import ContestHeader from "@/components/Contest/ContestHeader";

export default function EditContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [contest, setContest] = useState<Contest>();
  const [contestants, setContestants] = useState<
    Record<string, Contestant | undefined>
  >({});

  useEffect(() => {
    const load = async () => {
      const [contestRes, contestantsRes] = await Promise.all([
        fetch(`/api/contests/${id}`),
        fetch(`/api/contestants?contest_id=${id}`),
      ]);

      const contest = await contestRes.json();
      const data: Contestant[] = await contestantsRes.json();

      const map: Record<string, Contestant | undefined> = {};
      COUNTRIES.forEach((country) => {
        const found = data.find((c) => c.country === country.code);
        map[country.code] = found;
      });

      setContest(contest);
      setContestants(map);
    };

    load();
  }, [id]);

  const upsertContestant = async (
    country: string,
    update: Partial<Omit<Contestant, "id" | "contest_id" | "country">>
  ) => {
    const existing = contestants[country];
    let res = undefined;

    if (existing) {
      res = await fetch(`/api/contestants/${existing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
    } else {
      res = await fetch("/api/contestants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contest_id: id, country, ...update }),
      });
    }

    const data = await res.json();
    if (!res.ok) alert(data.error);
    else {
      setContestants((prev) => ({ ...prev, [country]: data }));
    }
  };

  const handleContestantImageUpload = async (country: string, file: File) => {
    const contestant = contestants[country];
    if (!contestant) return;

    const form = new FormData();
    form.append("file", file);
    form.append("id", contestant.id);
    const res = await fetch("/api/contestants/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (res.ok) {
      setContestants((prev) => ({
        ...prev,
        [country]: { ...contestant, image_url: data.url },
      }));
    } else {
      alert(data.error);
    }
  };

  if (!contest) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <ContestHeader contest={contest}>
        <Link href="/admin">Home</Link>
        <Link href={`/admin/contests/${contest.id}`}>Rank</Link>
        <Link href={`/admin/contests/${contest.id}/groups`}>Groups</Link>
      </ContestHeader>
      <div className={styles.contestants}>
        <h2>Contestants</h2>

        {COUNTRIES.map((country) => {
          const c = contestants[country.code];
          const isAutoFinalist =
            AUTO_FINALISTS.includes(country.code) ||
            contest.host === country.code;

          return (
            <div
              key={country.code}
              className={`${styles.contestant} ${
                c?.is_final || isAutoFinalist ? styles.finalist : ""
              }`}
            >
              <div className={styles.uploadContainer}>
                <DragDropUpload
                  previewUrl={c?.image_url}
                  onFileSelect={(file) =>
                    handleContestantImageUpload(country.code, file)
                  }
                />
              </div>

              <div className={styles.contestantForm}>
                <strong className={styles.contestantTitle}>
                  <Flag code={country.code} size={24} /> {country.name}
                </strong>
                <Input
                  placeholder="Performer"
                  defaultValue={c?.performer || ""}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && value !== c?.performer)
                      upsertContestant(country.code, { performer: value });
                  }}
                />
                <Input
                  placeholder="Song"
                  defaultValue={c?.song || ""}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && value !== c?.song)
                      upsertContestant(country.code, { song: value });
                  }}
                />
              </div>

              <Checkbox
                id={`contestant-${country.code}-finalist`}
                label="Finalist"
                disabled={isAutoFinalist}
                checked={isAutoFinalist || c?.is_final || false}
                onChange={() =>
                  upsertContestant(country.code, {
                    is_final: !c?.is_final,
                  })
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
