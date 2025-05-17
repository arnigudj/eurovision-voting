"use client";

import { ContestProvider } from "@/context/ContestContext";
import { GroupProvider } from "@/context/GroupContext";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ContestProvider>
        <GroupProvider>{children}</GroupProvider>
      </ContestProvider>
    </div>
  );
}
