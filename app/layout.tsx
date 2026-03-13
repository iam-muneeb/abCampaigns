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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          {/* Desktop sidebar — hidden on mobile, handled inside Sidebar component */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 h-screen overflow-y-auto bg-[#f4f6f8] relative z-10
            pt-14 lg:pt-0           /* space for mobile top bar */
            pb-16 lg:pb-0           /* space for mobile bottom tab bar */
          ">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}