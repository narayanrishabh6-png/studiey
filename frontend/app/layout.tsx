import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studiey — Never Miss an Opportunity",
  description: "Personalized admissions, research jobs, internships, conferences, funding and postdoc opportunities.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
