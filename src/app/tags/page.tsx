import Link from "next/link";
import { getAllTags, getAllCategories } from "@/lib/tags";

export default function TagsPage() {
  const tags = getAllTags();
  const categories = getAllCategories();

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">分类与标签</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">分类 (Categories)</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(([category, count]) => (
            <Link
              key={category}
              href={`/?search=${category}`}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              {category} <span className="opacity-60 ml-1">({count})</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">标签 (Tags)</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map(([tag, count]) => (
            <Link
              key={tag}
              href={`/?search=${tag}`}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              #{tag} <span className="opacity-60 ml-1">({count})</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
