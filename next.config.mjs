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
  //
  // beforeFiles (not the default afterFiles): applied before filesystem/route
  // resolution. Required for source:"/" on Vercel — an afterFiles "/" rewrite
  // is dropped when no index page/function exists, yielding a 404 in prod even
  // though `next start` honours it locally.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/landing.html' },
        { source: '/faq', destination: '/faq.html' },
        { source: '/contact', destination: '/contact.html' },
        { source: '/terms', destination: '/terms-of-use.html' },
        { source: '/privacy', destination: '/privacy-policy.html' },
      ],
    };
  },
};

export default nextConfig;
