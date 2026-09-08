import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScholarFlow — Academic Opportunities From Official Sources",
  description: "Personalized admissions, research jobs, internships, conferences, funding and postdoc opportunities.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
