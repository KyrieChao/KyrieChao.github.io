"use client";

import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { FiSearch, FiX } from "react-icons/fi";
import Link from "next/link";
import { format } from "date-fns";

type SearchResult = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState<SearchResult[]>([]);

  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data) => setIndex(data))
      .catch((err) => console.error("Failed to load search index", err));
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(index, {
      keys: ["title", "excerpt", "tags"],
      includeScore: true,
      threshold: 0.3,
    });

    const searchResults = fuse.search(query).map((result) => result.item);
    setResults(searchResults);
  }, [query, index]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle Search"
      >
        <FiSearch className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-xl p-4 z-50">
          <div className="flex items-center gap-2 mb-4">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="搜索文章..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-gray-900 dark:text-gray-100"
              autoFocus
            />
            <button onClick={() => setIsOpen(false)}>
              <FiX className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-4">
            {results.length > 0 ? (
              results.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <h4 className="font-bold text-sm mb-1 dark:text-gray-200">{post.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{post.date ? format(new Date(post.date), "yyyy-MM-dd") : "未知日期"}</span>
                    <div className="flex gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            ) : query ? (
              <p className="text-center text-gray-500 text-sm py-4">未找到相关文章</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
