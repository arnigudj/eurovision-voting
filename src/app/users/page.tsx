"use client";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WelcomePage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      router.push(`/users/${user.id}/voting`);
    }
  }, [user?.id, router]);

  return <div></div>;
}
