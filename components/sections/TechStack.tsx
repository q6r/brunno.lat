"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TECH_STACK } from "@/lib/data/techStack";
import { scaleIn, staggerFast, springSnappy } from "@/lib/motion";

export function TechStack() {
  const reduce = useReducedMotion();

  return (
    <section id="stack" className="py-20 sm:py-28">
      <SectionHeading
        kicker="Toolbox"
        title="Tech Stack"
        subtitle="The tools I reach for to ship refined products."
      />

      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        variants={reduce ? undefined : staggerFast}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, amount: 0.2 }}
      >
        {TECH_STACK.map((tech) => (
          <motion.div
            key={tech.name}
            variants={reduce ? undefined : scaleIn}
            whileHover={reduce ? undefined : { y: -3, scale: 1.03 }}
            transition={springSnappy}
            className="group flex items-center gap-3 rounded-card border border-subtle bg-card p-4 transition-colors hover:border-subtle-2"
          >
            <Image
              src={`https://cdn.simpleicons.org/${tech.slug}/${tech.iconColor}`}
              alt={tech.name}
              width={24}
              height={24}
              unoptimized
              className="h-6 w-6 shrink-0"
            />
            <span className="truncate text-sm font-medium text-primary">
              {tech.name}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
