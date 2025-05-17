"use client";

import { ContestProvider } from "@/context/ContestContext";
import { GroupProvider } from "@/context/GroupContext";
import { Suspense } from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ContestProvider>
        <GroupProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </GroupProvider>
      </ContestProvider>
    </div>
  );
}
