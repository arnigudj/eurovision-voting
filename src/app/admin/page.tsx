"use client";

import { useEffect, useState } from "react";
import { Contest } from "../api/contests/types";
import Link from "next/link";
import Button from "@/components/Button/Button";
import ContestForm from "@/components/Contest/ContestForm";
import styles from "./page.module.scss";
import Flag from "@/components/Flag/Flag";
import { Pencil2Icon } from "@radix-ui/react-icons";

export default function Admin() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest>();

  const loadContests = async () => {
    const res = await fetch("/api/contests");
    const data = await res.json();
    setContests(data);
  };

  useEffect(() => {
    loadContests();
  }, []);

  const editContest = async (contest: Contest) => {
    setSelectedContest(contest);
    setShowForm(true);
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Contests</h1>

        <Button
          onClick={() => {
            setShowForm((prev) => !prev);
          }}
        >
          Create
        </Button>
      </div>
      {showForm && (
        <ContestForm
          contest={selectedContest}
          onSave={() => {
            setShowForm(false);
            loadContests();
          }}
          onCancel={() => {
            setShowForm(false);
          }}
          onDelete={() => {
            setShowForm(false);
            loadContests();
          }}
        />
      )}
      <div className={styles.contests}>
        {contests.map((c) => (
          <div
            key={c.id}
            className={`${styles.contest} ${
              c.active ? styles.contestActive : ""
            }`}
          >
            <Link
              key={c.id}
              href={`/admin/contests/${c.id}/edit`}
              className={styles.contestLink}
            >
              {c.host && <Flag code={c.host} />}
              <strong>{c.id}</strong>
            </Link>
            <Button
              className={styles.contestEditBtn}
              onClick={() => editContest(c)}
            >
              <Pencil2Icon />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
