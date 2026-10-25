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
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
