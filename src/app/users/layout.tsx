"use client";

import Login from "@/components/Login/Login";
import { ContestProvider } from "@/context/ContestContext";
import { GroupProvider } from "@/context/GroupContext";
import { UserProvider } from "@/context/UserContext";
import { UserGroupProvider } from "@/context/UserGroupContext";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <UserProvider>
        <ContestProvider>
          <GroupProvider>
            <Login>
              <UserGroupProvider>{children}</UserGroupProvider>
            </Login>
          </GroupProvider>
        </ContestProvider>
      </UserProvider>
    </div>
  );
}
