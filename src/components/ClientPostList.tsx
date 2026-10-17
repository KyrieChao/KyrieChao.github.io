"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useSearchParams, usePathname } from "next/navigation";
import { FiFileText, FiFolder } from "react-icons/fi";
import { PostData } from "@/lib/posts";

const POSTS_PER_PAGE = 24;

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
  const postGroups = currentPosts.reduce<Array<{ month: string; posts: PostData[] }>>((groups, post) => {
    const month = post.date?.slice(0, 7) ?? "日期未知";
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.month === month) {
      lastGroup.posts.push(post);
    } else {
      groups.push({ month, posts: [post] });
    }

    return groups;
  }, []);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-100">
          {searchParam ? `搜索结果: "${searchParam}"` : "文章目录"}
        </h2>
        <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
          {filteredPosts.length} 个文件
        </span>
      </div>

      {postGroups.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {postGroups.map(({ month, posts }) => (
            <section key={month} aria-label={`${month} 文章`}>
              <h3 className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3 font-mono text-sm font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-950/60 dark:text-gray-300">
                <FiFolder className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                {month}
                <span className="ml-auto text-xs font-normal text-gray-400">{posts.length} 个文件</span>
              </h3>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {posts.map(({ id, date, title, excerpt, categories, tags }) => {
                  const fileName = `${id.split("/").at(-1)}.md`;

                  return (
                    <li key={id} className="group grid gap-2 px-5 py-4 transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/20 md:grid-cols-[120px_minmax(0,1fr)_minmax(180px,260px)] md:items-center md:gap-5">
                      <time dateTime={date} className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {date ? format(new Date(date), "yyyy-MM-dd") : "日期未知"}
                      </time>
                      <div className="min-w-0">
                        <Link href={`/posts/${id}`} className="font-medium text-gray-900 transition-colors group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                          {title}
                        </Link>
                        {excerpt && (
                          <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">{excerpt}</p>
                        )}
                      </div>
                      <div className="flex min-w-0 items-center gap-2 md:justify-end">
                        <FiFileText className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                        <span className="truncate font-mono text-xs text-gray-500 dark:text-gray-400" title={fileName}>
                          {fileName}
                        </span>
                        {(categories?.[0] || tags?.[0]) && (
                          <span className="hidden shrink-0 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400 lg:inline">
                            {categories?.[0] ?? tags?.[0]}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          没有找到匹配的文章。
        </p>
      )}

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
