/* eslint-disable @next/next/no-img-element */
"use client";

import { useContest } from "@/context/ContestContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import DragDropUpload from "../DragDropUpload/DragDropUpload";
import Input from "../Input/Input";
import Button from "../Button/Button";
import styles from "./Login.module.scss";

interface Props {
  children: ReactNode;
}

export default function Login({ children }: Props) {
  const { user, setUser, isLoading: isUserLoading } = useUser();
  const { contest } = useContest();
  const [preview, setPreview] = useState<string>();
  const [nickname, setNickname] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      setError("Nickname is required");
      return;
    }
    if (!imageFile) {
      setError("Selfie is required");
      return;
    }

    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("file", imageFile);
    form.append("nickname", nickname);

    const res = await fetch("/api/users", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
    } else {
      setUser(data);
      router.push(`/users/${data.id}/voting`);
    }
  };

  if (isUserLoading) {
    return <></>;
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.bannerContainer}>
        {contest?.banner_url && <img src={contest?.banner_url} alt="banner" />}
      </div>

      <div className={styles.form}>
        <h2>Eurovision Royale</h2>
        <div className={styles.uploader}>
          <DragDropUpload
            label="Upload your selfie"
            previewUrl={preview}
            onFileSelect={(file) => {
              setImageFile(file);
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
        <Input
          type="text"
          placeholder="Enter your name"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading ? "Submitting..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
