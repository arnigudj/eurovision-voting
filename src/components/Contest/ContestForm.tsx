import { COUNTRIES } from "@/lib/countries";
import DragDropUpload from "../DragDropUpload/DragDropUpload";
import DropDown from "../DropDown/DropDown";
import Label from "../Label/Label";
import Input from "../Input/Input";
import Button from "../Button/Button";
import styles from "./ContestForm.module.scss";
import { Contest } from "@/app/api/contests/types";
import { useState } from "react";
import Checkbox from "../Checkbox/Checkbox";

interface Props {
  contest?: Contest;
  onSave?: (contest: Contest) => void;
  onDelete?: (contest: Contest) => void;
  onCancel?: () => void;
}

export default function ContestForm({
  contest,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const [host, setHost] = useState(contest?.host || "");
  const [id, setId] = useState(contest?.id || "");
  const [bannerUrl, setBannerUrl] = useState(contest?.banner_url || "");
  const [active, setActive] = useState(contest?.active || !contest || false);

  const deleteContest = async (id: string) => {
    if (!contest?.id) return;
    const confirmed = confirm(`Delete contest "${id}"?`);
    if (!confirmed) return;

    const res = await fetch("/api/contests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    if (onDelete) onDelete(contest);
  };

  const activateContest = async (id: string) => {
    const res = await fetch("/api/contests/active", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
  };

  const handleSave = async () => {
    const body = JSON.stringify({
      id,
      host,
      active,
      description: "",
      banner_url: bannerUrl,
    });

    let res;
    if (contest) {
      res = await fetch(`/api/contests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } else {
      res = await fetch("/api/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    }
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    if (active) {
      await activateContest(data.id);
    }
    if (onSave) onSave(data);
  };

  const handleBannerUpload = async (file: File) => {
    if(!id) {
        alert("Please enter contest name first");
        return;
    };
    const form = new FormData();
    form.append("file", file);
    form.append("id", id);
    const res = await fetch("/api/contests/banner", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (res.ok) {
      setBannerUrl(data.url);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Contest</h2>

      <div className={styles.contestForm}>
        <div>
          <Label htmlFor="contest-name">Name</Label>
          <Input
            id="contest-name"
            placeholder="Enter contest name"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>
        <DropDown
          value={host || ""}
          onChange={async (newHost) => {
            setHost(newHost);
          }}
          options={[{ value: "", label: "Select host" }].concat(
            COUNTRIES.map((country) => ({
              label: country.name,
              value: country.code,
            }))
          )}
          id="host-country"
          label="Host country"
        />
        <div>
          <Label>Banner</Label>
          <DragDropUpload
            onFileSelect={(file) => handleBannerUpload(file)}
            previewUrl={contest?.banner_url}
          />
        </div>

        <Checkbox
          id={`contest-active`}
          label="Active"
          checked={active}
          onChange={() => setActive((prev) => !prev)}
        />
        <div className={styles.contestFormButtons}>
          <Button onClick={handleSave} disabled={!id.trim()}>
            Save
          </Button>
          <Button
            onClick={() => {
              if (onCancel) onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
                if (contest) deleteContest(contest.id);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
