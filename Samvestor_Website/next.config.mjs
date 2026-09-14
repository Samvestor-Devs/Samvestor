import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // pin the workspace root to this folder — the repo root is one level up,
    // so without this Turbopack looks outside the app for a lockfile
    turbopack: {
        root: dirname(fileURLToPath(import.meta.url)),
    },
};

export default nextConfig;
