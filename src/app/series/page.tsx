import Link from "next/link";
import { getAllSeries } from "@/lib/series";
import { format } from "date-fns";

export default function SeriesPage() {
  const seriesMap = getAllSeries();
  const seriesNames = Object.keys(seriesMap).sort();

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">系列专栏</h1>
        <p className="text-gray-600 dark:text-gray-400">系统性的专题文章合集</p>
      </header>

      {seriesNames.length === 0 ? (
        <p className="text-center text-gray-500">暂无系列文章。</p>
      ) : (
        <div className="space-y-12">
          {seriesNames.map((seriesName) => (
            <section key={seriesName} className="border rounded-lg p-6 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-2xl font-bold mb-6 dark:text-gray-100 flex items-center">
                <span className="mr-2">📚</span> {seriesName}
                <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {seriesMap[seriesName].length} 篇
                </span>
              </h2>
              <ul className="space-y-4">
                {seriesMap[seriesName].map((post, index) => (
                  <li key={post.id} className="flex items-start">
                    <span className="mr-4 text-gray-400 font-mono text-sm pt-1">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Link 
                      href={`/posts/${post.id}`} 
                      className="group flex-1"
                    >
                      <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-gray-200">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {post.excerpt}
                      </p>
                    </Link>
                    <time className="text-xs text-gray-400 whitespace-nowrap ml-4 pt-1 hidden sm:block">
                      {post.date ? format(new Date(post.date), "yyyy-MM-dd") : ""}
                    </time>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
