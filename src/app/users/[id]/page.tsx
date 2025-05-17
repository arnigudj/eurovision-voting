"use client";

import Button from "@/components/Button/Button";
import GroupSelection from "@/components/Group/GroupSelection";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.scss";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const { logout } = useUser();

  useEffect(() => {
    const load = async () => {};
    load();
  }, []);

  return (
    <div className={styles.container}>
      <GroupSelection />

      <Button
        color="danger"
        onClick={() => {
          const confirmed = confirm(
            `Are you sure you want to delete this account and start fresh?`
          );
          if (!confirmed) return;
          logout();
          router.push("/");
        }}
      >
        Delete Account
      </Button>
      <Button
        onClick={() => {
          router.push(`/users/${user?.id}/voting`);
        }}
      >
        Back to voting
      </Button>
    </div>
  );
}
