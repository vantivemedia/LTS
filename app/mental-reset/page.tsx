import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import MentalResetClient from "./MentalResetClient";

// Red italic serif used for the accent word in the title, matching the poster.
const serif = Playfair_Display({ subsets: ["latin"], style: ["italic"], weight: ["700", "800"] });

const TITLE = "The Next Rep: The Mental Reset";
const DESCRIPTION =
  "A 90-minute basketball workshop on resilience, confidence, and mental discipline. Friday, October 23 at The Hoop. Grades 7–12, limited to 10 athletes per session.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ltseliteprep.ca"),
  title: `${TITLE} | LTS Elite Prep`,
  description: DESCRIPTION,
  alternates: { canonical: "/mental-reset" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/mental-reset",
    siteName: "LTS Elite Prep",
    type: "website",
    locale: "en_CA",
    images: [{ url: "/images/mental-reset-og-v2.jpg", width: 1200, height: 630, alt: "The Next Rep: The Mental Reset. Friday, October 23 at The Hoop." }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/mental-reset-og-v2.jpg"],
  },
};

export default function MentalResetPage() {
  return <MentalResetClient serifClass={serif.className} />;
}
