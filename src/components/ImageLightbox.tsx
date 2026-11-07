"use client";

import { useEffect, useState } from "react";

export function ImageLightbox() {
  const [active, setActive] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>("article .prose img"));

    const bindings = images.map((img) => {
      const open = () => setActive({ src: img.currentSrc || img.src, alt: img.alt });
      img.addEventListener("click", open);
      img.style.cursor = "zoom-in";
      return { img, open };
    });

    return () => {
      bindings.forEach(({ img, open }) => {
        img.removeEventListener("click", open);
        img.style.cursor = "";
      });
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={() => setActive(null)}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      <button
        type="button"
        onClick={() => setActive(null)}
        className="absolute right-5 top-5 rounded-md px-2 py-1 text-2xl leading-none text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="关闭预览"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={active.src}
        alt={active.alt}
        className="max-h-full max-w-full rounded object-contain"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
