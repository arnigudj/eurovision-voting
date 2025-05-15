"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const [nickname, setNickname] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("nickname");
    if (saved) {
      router.push("/voting");
    }
  }, [router]);

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
      localStorage.setItem("nickname", nickname);
      router.push("/voting");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Join Eurovision Pool</h1>

      <input
        type="text"
        placeholder="Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />

      <div style={{ marginTop: 16 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setImageFile(file || null); // ← this line is essential
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
        {preview && (
          <Image
            src={preview}
            alt="Preview"
            style={{ maxWidth: 200, marginTop: 8 }}
          />
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 16 }}
      >
        {loading ? "Submitting..." : "Enter"}
      </button>
    </div>
  );
}
