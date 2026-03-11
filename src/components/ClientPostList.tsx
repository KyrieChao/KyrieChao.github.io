"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useSearchParams, usePathname } from "next/navigation";
import { PostData } from "@/lib/posts";

const POSTS_PER_PAGE = 6;

export function ClientPostList({ allPostsData }: { allPostsData: PostData[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = searchParams.get("page");
  const searchParam = searchParams.get("search");

  const page = pageParam ? parseInt(pageParam) : 1;

  let filteredPosts = allPostsData;
  if (searchParam) {
    filteredPosts = allPostsData.filter(post => 
      post.title.toLowerCase().includes(searchParam.toLowerCase()) ||
      (Array.isArray(post.categories) && post.categories.some((cat: string) => cat.toLowerCase().includes(searchParam.toLowerCase()))) ||
      (Array.isArray(post.tags) && post.tags.some((tag: string) => tag.toLowerCase().includes(searchParam.toLowerCase())))
    );
  }

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPosts = filteredPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100">
        {searchParam ? `搜索结果: "${searchParam}"` : "最新文章"}
      </h2>
      <ul className="grid gap-6 md:grid-cols-2">
        {currentPosts.map(({ id, date, title, excerpt, categories, tags }) => (
          <li key={id} className="border dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 flex flex-col h-full group">
            <Link href={`/posts/${id}`} className="block flex-grow">
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-gray-100 line-clamp-2">
                {title}
              </h3>
              {excerpt && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-3">
                  {excerpt}
                </p>
              )}
            </Link>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mt-auto pt-4 border-t dark:border-gray-800">
              <time>{date ? format(new Date(date), "yyyy-MM-dd") : "未知日期"}</time>
              <div className="flex gap-2">
                {Array.isArray(categories) && categories.slice(0, 1).map((cat) => (
                  <span key={cat} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                    {cat}
                  </span>
                ))}
                {Array.isArray(tags) && tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between mt-10">
          {page > 1 ? (
            <Link
              href={`${pathname}?page=${page - 1}${searchParam ? `&search=${searchParam}` : ""}`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              ← 上一页
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-gray-500 self-center">
            第 {page} 页 / 共 {totalPages} 页
          </span>
          {page < totalPages && (
            <Link
              href={`${pathname}?page=${page + 1}${searchParam ? `&search=${searchParam}` : ""}`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              下一页 →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
