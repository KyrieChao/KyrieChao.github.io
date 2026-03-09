import { getAllPostIds, getPostData, getAdjacentPosts } from "@/lib/posts";
import { format } from "date-fns";
import Link from "next/link";
import { TableOfContents } from "@/components/TableOfContents";
import { Comments } from "@/components/Comments";
import { ReadingProgress } from "@/components/ReadingProgress";

// 静态导出必须实现此函数，告知 Next.js 有哪些路径需要预渲染
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((path) => ({
    id: path.params.id, 
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  
  // Need to decode here as well if we encoded in generateStaticParams?
  // Next.js App Router usually decodes params automatically.
  // But our getPostData handles decoding.
  const postId = id.map(segment => decodeURIComponent(segment)).join("/");
  
  const postData = await getPostData(postId);

  return {
    title: postData.title,
    openGraph: {
      title: postData.title,
      description: postData.excerpt || postData.title,
      type: 'article',
      publishedTime: postData.date,
      images: [
        {
          url: `/og/${postId}.png`,
          width: 1200,
          height: 630,
          alt: postData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.title,
      description: postData.excerpt || postData.title,
      images: [`/og/${postId}.png`],
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = await params;
  // id params are usually decoded by Next.js.
  // But since we are encoding them in generateStaticParams, let's make sure.
  const postId = id.map(segment => decodeURIComponent(segment)).join("/");
  
  const postData = await getPostData(postId);
  const { prev, next } = getAdjacentPosts(postId);

  return (
    <div className="flex flex-col items-center w-full">
      <ReadingProgress />
      <div className="max-w-[1920px] w-full px-8 pt-8">
        <Link
          href="/"
          className="text-blue-500 hover:underline inline-block dark:text-blue-400"
        >
          ← 返回首页
        </Link>
      </div>
      <div className="flex justify-center w-full">
        <article className="max-w-4xl w-full py-10 px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">{postData.title}</h1>
            <div className="text-gray-500 dark:text-gray-400">
              {postData.date
                ? format(new Date(postData.date), "yyyy-MM-dd")
                : "Unknown Date"}
            </div>
          </div>

          <div
            className="prose lg:prose-xl dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
          />
          
          {/* Previous/Next Post Navigation */}
          <div className="flex flex-col sm:flex-row justify-between border-t border-gray-200 dark:border-gray-700 pt-6 mb-12 gap-4">
            <div className="w-full sm:w-1/2">
              {prev && (
                <Link href={`/posts/${prev.id}`} className="block group">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 group-hover:text-blue-500 transition-colors">
                    ← 上一篇
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {prev.title}
                  </div>
                </Link>
              )}
            </div>
            <div className="w-full sm:w-1/2 text-left sm:text-right">
              {next && (
                <Link href={`/posts/${next.id}`} className="block group">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 group-hover:text-blue-500 transition-colors">
                    下一篇 →
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {next.title}
                  </div>
                </Link>
              )}
            </div>
          </div>

          <Comments />
        </article>
        <TableOfContents toc={Array.isArray(postData.toc) ? postData.toc : []} />
      </div>
    </div>
  );
}
