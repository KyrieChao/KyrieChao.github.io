"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; text: string; level: number };

export function TableOfContents() {
  const [activeId, setActiveId] = useState("");
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const content = document.querySelector("article .prose");
    if (!content) return;

    const updateHeadings = () => {
      const headings = Array.from(
        content.querySelectorAll<HTMLElement>("h2[id], h3[id], h4[id]")
      ).filter((heading) => {
        let details = heading.parentElement?.closest("details");
        while (details) {
          if (!details.open) return false;
          details = details.parentElement?.closest("details") ?? null;
        }
        return true;
      });

      setItems(
        headings.map((heading) => ({
          id: heading.id,
          text: heading.textContent?.trim() ?? "",
          level: Number(heading.tagName.slice(1)),
        }))
      );
    };

    const handleDetailsToggle = () => {
      setActiveId("");
      updateHeadings();
    };
    const detailsElements = Array.from(content.querySelectorAll("details"));
    detailsElements.forEach((details) =>
      details.addEventListener("toggle", handleDetailsToggle)
    );
    updateHeadings();

    return () => {
      detailsElements.forEach((details) =>
        details.removeEventListener("toggle", handleDetailsToggle)
      );
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0.5,
      }
    );

    items.forEach(({ id }) => {
      const heading = document.getElementById(id);
      if (heading) observer.observe(heading);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <div className="hidden xl:block fixed right-[max(2rem,calc(50%-48rem+2rem))] top-32 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto p-4 border-l border-gray-200 dark:border-gray-800">
      <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">目录</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className={`transition-all duration-200 border-l-2 ${
              activeId === item.id
                ? "text-blue-600 dark:text-blue-400 font-medium border-blue-600 -ml-[17px] pl-[15px]"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-transparent -ml-[17px] pl-[15px]"
            }`}
          >
            <a
              href={`#${item.id}`}
              className={`block py-1 ${
                item.level === 3 ? "pl-4" : item.level === 4 ? "pl-8" : ""
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
