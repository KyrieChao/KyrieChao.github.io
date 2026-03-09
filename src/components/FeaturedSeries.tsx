import Link from "next/link";
import { PostData } from "@/lib/posts";

interface FeaturedSeriesProps {
  posts: PostData[];
  className?: string;
}

export function FeaturedSeries({ posts, className }: FeaturedSeriesProps) {
  const seriesMap: Record<string, number> = {};
  
  posts.forEach(post => {
    if (post.series) {
      seriesMap[post.series] = (seriesMap[post.series] || 0) + 1;
    }
  });

  const seriesList = Object.entries(seriesMap).map(([name, count]) => ({ name, count }));

  if (seriesList.length === 0) return null;

  return (
    <section className={className ?? "my-12"}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold dark:text-gray-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-library"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
          精选专栏
        </h2>
        <Link href="/series" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          查看全部
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {seriesList.slice(0, 3).map(({ name, count }) => (
          <Link 
            key={name} 
            href={`/series`} 
            className="group block p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border dark:border-gray-700 rounded-xl hover:shadow-md transition-all"
          >
            <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-gray-100">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              包含 {count} 篇文章
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
