import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "Eurovision voter",
  description: "A voting app for Eurovision",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Theme>
          <UserProvider>{children}</UserProvider>
        </Theme>
      </body>
    </html>
  );
}
