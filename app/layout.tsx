// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Providers from "./components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AB Campaigns | Notification Manager",
  description: "Notification Engine for AttireBulk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f4f6f8] text-slate-800 flex h-screen overflow-hidden antialiased`}>
        <Providers>
          <Sidebar />

          {/* Main Content Area - Light Background */}
          <main className="flex-1 h-screen overflow-y-auto bg-[#f4f6f8] relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}