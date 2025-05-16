"use client";

import { useCallback, useRef, useState } from "react";
import styles from "./DragDropUpload.module.scss";

type Props = {
  onFileSelect: (file: File) => void;
  previewUrl?: string;
};

export default function DragDropUpload({ onFileSelect, previewUrl }: Props) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(previewUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
        setPreview(URL.createObjectURL(file));
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className={styles.hiddenInput}
      />
      {preview ? (
        <img src={preview} alt="Preview" className={styles.preview} />
      ) : (
        <p>Drop an image here or click to upload</p>
      )}
    </div>
  );
}
