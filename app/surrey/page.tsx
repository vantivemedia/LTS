import type { Metadata } from "next";
import SurreyClient from "./SurreyClient";

const TITLE = "Transition to High School Basketball: Surrey";
const DESCRIPTION =
  "LTS Elite Prep is coming to Surrey! Three nights of training for Grade 7 to 9 athletes at Princess Margaret Secondary on November 3, 10 and 17. $65 drop-in or $150 for all three.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ltseliteprep.ca"),
  title: `${TITLE} | LTS Elite Prep`,
  description: DESCRIPTION,
  alternates: { canonical: "/surrey" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/surrey",
    siteName: "LTS Elite Prep",
    type: "website",
    locale: "en_CA",
    images: [{ url: "/images/surrey-og-v3.jpg", width: 1200, height: 630, alt: "Transition to High School Basketball in Surrey, November 3, 10 and 17" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/surrey-og-v3.jpg"],
  },
};

export default function SurreyPage() {
  return <SurreyClient />;
}
