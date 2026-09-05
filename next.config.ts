import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone with a minimal server.js and only the
  // node_modules actually needed at runtime - the container image doesn't
  // need the full node_modules tree or the Next.js CLI.
  output: "standalone",
};

export default nextConfig;
