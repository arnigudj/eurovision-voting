"use client";

import ContestHeader from "@/components/Contest/ContestHeader";
import UserAvatar from "@/components/User/UserAvatar";
import { useContest } from "@/context/ContestContext";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import styles from "./layout.module.scss";
export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  const { contest } = useContest();

  return (
    <div>
      <ContestHeader contest={contest}>
        <Link href={`/users/${user?.id}`}>
          <UserAvatar user={user} />
        </Link>
      </ContestHeader>
      <section className={styles.content}>{children}</section>
    </div>
  );
}
