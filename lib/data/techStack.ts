export interface TechItem {
  name: string;
  /** Simple Icons slug (https://simpleicons.org) */
  slug: string;
  /** Icon color for the CDN url — hex without `#`, or a CSS name like "white" (for dark logos) */
  iconColor: string;
}

export const TECH_STACK: TechItem[] = [
  { name: "Next.js", slug: "nextdotjs", iconColor: "white" },
  { name: "React", slug: "react", iconColor: "61DAFB" },
  { name: "TypeScript", slug: "typescript", iconColor: "3178C6" },
  { name: "Tailwind CSS", slug: "tailwindcss", iconColor: "38BDF8" },
  { name: "Node.js", slug: "nodedotjs", iconColor: "5FA04E" },
  { name: "PostgreSQL", slug: "postgresql", iconColor: "4169E1" },
  { name: "Prisma", slug: "prisma", iconColor: "white" },
  { name: "Docker", slug: "docker", iconColor: "2496ED" },
  { name: "Angular", slug: "angular", iconColor: "DD0031" },
  { name: "Svelte", slug: "svelte", iconColor: "FF3E00" },
  { name: "Elasticsearch", slug: "elasticsearch", iconColor: "00BFB3" },
  { name: "MongoDB", slug: "mongodb", iconColor: "47A248" },
  { name: "Rust", slug: "rust", iconColor: "white" },
  { name: "Ruby", slug: "ruby", iconColor: "CC342D" },
  { name: "Lua", slug: "lua", iconColor: "white" },
];
