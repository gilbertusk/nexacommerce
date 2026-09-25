import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    /**
     * Pin the workspace root to the monorepo root.
     *
     * Turbopack normally infers the root from the nearest lockfile, but it
     * stops at a Git repository boundary. This directory contains a nested,
     * empty `.git`, so the inferred root became the app folder itself and
     * `next` — hoisted to the monorepo's node_modules — became unresolvable.
     * Setting the root explicitly is the documented fix and does not depend on
     * that nested repository being removed.
     */
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
