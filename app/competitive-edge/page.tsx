import type { Metadata } from "next";
import CompetitiveEdgeClient from "./CompetitiveEdgeClient";

const TITLE = "The Competitive Edge: The Next Rep Workshop III";
const DESCRIPTION =
  "Your response is your competitive edge. A mental performance workshop with competitive basketball training for Grades 7–12. Wednesday, November 11. $85 per athlete, 12 athletes per group.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ltseliteprep.ca"),
  title: `${TITLE} | LTS Elite Prep`,
  description: DESCRIPTION,
  alternates: { canonical: "/competitive-edge" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/competitive-edge",
    siteName: "LTS Elite Prep",
    type: "website",
    locale: "en_CA",
    images: [{ url: "/images/competitive-edge-og.jpg", width: 1200, height: 630, alt: "The Next Rep Workshop III: The Competitive Edge. Wednesday, November 11." }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/competitive-edge-og.jpg"],
  },
};

export default function CompetitiveEdgePage() {
  return <CompetitiveEdgeClient />;
}
