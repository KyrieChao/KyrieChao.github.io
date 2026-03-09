"use client";

import { useEffect, useState } from "react";

export function TableOfContents({ toc }: { toc: any[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // 简单的 IntersectionObserver 可能导致多个标题同时激活
    // 我们可以使用一个 Map 来存储所有可见标题的可见比例
    // 然后取可见比例最高的那个作为 activeId
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        rootMargin: "-20% 0% -35% 0%", // 调整检测区域，使其更符合阅读习惯
        threshold: 0.5 
      }
    );

    const headings = document.querySelectorAll("h2, h3, h4");
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  if (!Array.isArray(toc) || toc.length === 0) return null;

  return (
    <div className="hidden xl:block fixed right-[max(2rem,calc(50%-48rem+2rem))] top-32 w-64 p-4 border-l border-gray-200 dark:border-gray-800">
      <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">目录</h3>
      <ul className="space-y-2 text-sm">
        {toc.map((item) => (
          <li
            key={item.id}
            className={`${
              item.level === 3 ? "pl-4" : ""
            } transition-all duration-200 border-l-2 ${
              activeId === item.id
                ? "text-blue-600 dark:text-blue-400 font-medium border-blue-600 -ml-[17px] pl-[15px]" // 高亮状态：文字变蓝，左侧添加蓝色指示条
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-transparent -ml-[17px] pl-[15px]" // 普通状态：透明边框占位，防止文字跳动
            }`}
          >
            <a href={`#${item.id}`} className="block py-1">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
