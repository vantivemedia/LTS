import type { Metadata } from "next";
import InviteClient from "./InviteClient";

export const metadata: Metadata = {
  title: "You've Been Selected — Blueprint Workshop",
  description: "You've been personally selected to attend the Blueprint Workshop, LTS Elite Prep's exclusive one-day intensive. August 27 · The Hoop, Richmond BC.",
  openGraph: {
    title: "You've Been Selected — Blueprint Workshop",
    description: "An exclusive one-day intensive with LTS Elite Prep. Limited to invited athletes only.",
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "You've Been Selected — Blueprint Workshop",
    description: "An exclusive one-day intensive with LTS Elite Prep. Limited to invited athletes only.",
  },
};

export default function InvitePage() {
  return <InviteClient />;
}
