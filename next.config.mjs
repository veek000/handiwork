import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this project dir. A stray parent lockfile
  // (~/package-lock.json) otherwise makes Turbopack infer the wrong root.
  turbopack: { root: __dirname },

  // The completed static pages live in public/ and are served verbatim.
  // Each rewrite maps a clean route to its public HTML file. No app/ route
  // owns these paths — a matching page would silently override the rewrite.
  async rewrites() {
    return [
      { source: '/', destination: '/landing.html' },
      { source: '/faq', destination: '/faq.html' },
      { source: '/contact', destination: '/contact.html' },
    ];
  },
};

export default nextConfig;
