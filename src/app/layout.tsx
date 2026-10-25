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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedMode = localStorage.getItem('stride_theme_mode');
                if (savedMode === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50/90 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors duration-200">
        {/* Ambient Glassmorphism Background Mesh & Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
          <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/25 to-cyan-500/20 blur-3xl opacity-75 dark:opacity-60" />
          <div className="absolute top-1/4 -right-28 w-[42rem] h-[42rem] rounded-full bg-gradient-to-bl from-teal-500/25 via-emerald-600/20 to-blue-600/25 blur-3xl opacity-70 dark:opacity-55" />
          <div className="absolute -bottom-24 left-1/4 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-violet-600/25 via-indigo-500/20 to-purple-600/25 blur-3xl opacity-65 dark:opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-20" />
        </div>
        {children}
      </body>
    </html>
  );
}
