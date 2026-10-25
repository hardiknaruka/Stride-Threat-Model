import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STRIDE Threat Modeling Workspace",
  description:
    "Organize, assess, prioritize, and track microservices threats with the STRIDE methodology.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50/90 text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
        {/* Ambient Glassmorphism Background Mesh & Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
          <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-blue-300/35 via-sky-200/30 to-indigo-300/25 blur-3xl opacity-80" />
          <div className="absolute top-1/4 -right-28 w-[38rem] h-[38rem] rounded-full bg-gradient-to-bl from-teal-300/30 via-emerald-200/20 to-sky-200/25 blur-3xl opacity-75" />
          <div className="absolute -bottom-24 left-1/4 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-indigo-200/30 via-purple-200/20 to-violet-200/25 blur-3xl opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        </div>
        {children}
      </body>
    </html>
  );
}
