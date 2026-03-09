"use client";

import { useEffect, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { createRoot } from "react-dom/client";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded transition-all opacity-0 group-hover:opacity-100"
      aria-label="Copy code"
    >
      {copied ? <FiCheck className="w-4 h-4 text-green-400" /> : <FiCopy className="w-4 h-4" />}
    </button>
  );
};

export function CodeBlockEnhancer() {
  useEffect(() => {
    const codeBlocks = document.querySelectorAll("pre");

    codeBlocks.forEach((pre) => {
      // Avoid double mounting
      if (pre.classList.contains("enhanced")) return;
      pre.classList.add("enhanced", "relative", "group");

      const code = pre.querySelector("code")?.innerText || "";
      const wrapper = document.createElement("div");
      // Need to position wrapper absolutely
      wrapper.className = "absolute top-0 right-0";
      pre.appendChild(wrapper);

      const root = createRoot(wrapper);
      root.render(<CopyButton text={code} />);
    });
  }, []);

  return null;
}
