import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nemotron AXIOM | Autonomous Neuro-Symbolic Verification",
  description:
    "Autonomous Neuro-Symbolic Verification & Provably Correct Code Synthesizer powered by NVIDIA Nemotron-70B on Nebius Token Factory, Z3 SMT Solver, and Tavily Search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-axiom-dark text-foreground antialiased selection:bg-nvidia selection:text-black">
        {children}
      </body>
    </html>
  );
}
