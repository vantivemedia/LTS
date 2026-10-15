import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The guidebook PDF lives in /private and is read at runtime by the unlock-gated
  // download / email routes, so make sure it ships with those serverless functions.
  outputFileTracingIncludes: {
    "/api/guidebook/*": ["./private/**/*"],
  },
  // LTS PRO is request-only now — send old booking / pass links to the request page.
  async redirects() {
    return ["/book", "/buy-pass"].map((source) => ({
      source,
      has: [{ type: "query" as const, key: "program", value: "pro" }],
      destination: "/pro",
      permanent: false,
    }));
  },
};

export default nextConfig;
