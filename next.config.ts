import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Actions/Components read the sales-playbook knowledge base
  // (src/modules/ai/knowledge/*.md) from disk via fs.readFileSync. Vercel's
  // build-time file tracing can miss plain-text files that aren't imported
  // as modules, so this is declared explicitly to guarantee they ship with
  // every serverless function bundle (see DECISIONS.md "Why the Sales
  // Playbook Is File-Based, Not a Database Entity").
  outputFileTracingIncludes: {
    "/**": ["./src/modules/ai/knowledge/*.md"],
  },
};

export default nextConfig;
