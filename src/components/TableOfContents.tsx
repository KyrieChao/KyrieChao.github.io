"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function TableOfContents({ toc }: { toc: any[] }) {
  const [activeId, setActiveId] = useState("");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    const headings = document.querySelectorAll("h2, h3, h4");
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  if (!Array.isArray(toc) || toc.length === 0) return null;

  return (
    <div className="hidden xl:block fixed right-[max(2rem,calc(50%-48rem+2rem))] top-32 w-64 p-4 border-l border-gray-200 dark:border-gray-800">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
        style={{ scaleX }}
      />
      <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">目录</h3>
      <ul className="space-y-2 text-sm">
        {toc.map((item) => (
          <li
            key={item.id}
            className={`${
              item.level === 3 ? "pl-4" : ""
            } ${
              activeId === item.id
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <a href={`#${item.id}`} className="block py-1 transition-colors">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
