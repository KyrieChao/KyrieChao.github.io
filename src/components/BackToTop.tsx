"use client";

import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-6 z-40 rounded-full border border-gray-200 bg-white/90 p-3 text-gray-600 shadow-lg backdrop-blur transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label="回到顶部"
      title="回到顶部"
    >
      <FiArrowUp className="h-4 w-4" />
    </button>
  );
}
