import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
export const metadata: Metadata = {
  title: "AXIOS Risk — evidence before action",
  description:
    "Traceable maintenance investigations across telemetry, service records and shift notes.",
};
export default function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
