import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css"; // Math support
// Highlight.js styles are now in globals.css to support dark mode switching
import { Providers } from "./providers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search } from "@/components/Search";
import { CodeBlockEnhancer } from "@/components/CodeBlockEnhancer";
import Link from "next/link";
import { FiActivity, FiCode, FiGithub, FiRss } from "react-icons/fi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kyriechao.github.io"),
  title: "KyrieChao Blog",
  description: "记录 Linux 系统编程、嵌入式开发与项目实践。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen h-full bg-background font-sans text-foreground transition-colors duration-300`}
      >
        <Providers>
          <CodeBlockEnhancer />
          <div className="min-h-screen flex flex-col">
            <header className="mx-auto flex w-full max-w-[1360px] items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-8 xl:px-12">
              <Link href="/" className="text-lg font-semibold tracking-tight text-gray-950 transition-colors hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                KyrieChao
              </Link>
              <div className="flex items-center gap-2 sm:gap-4">
                <nav aria-label="主导航" className="flex items-center gap-3 text-xs font-medium sm:gap-4 sm:text-sm">
                  <Link href="/posts" className="text-gray-600 transition-colors hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-300">文章</Link>
                  <Link href="/series" className="text-gray-600 transition-colors hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-300">专栏</Link>
                  <Link href="/tags" className="hidden text-gray-600 transition-colors hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-300 sm:inline-flex">标签</Link>
                  <Link href="/about" className="text-gray-600 transition-colors hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-300">关于</Link>
                </nav>
                <div className="flex items-center gap-1 border-l border-gray-200 pl-2 dark:border-gray-800 sm:gap-1.5 sm:pl-3">
                  <a href="/rss.xml" target="_blank" rel="noopener noreferrer" aria-label="RSS 订阅" title="RSS 订阅" className="hidden rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-300 sm:inline-flex">
                    <FiRss className="h-4 w-4" />
                  </a>
                  <Link href="/activity" aria-label="活动记录" title="活动记录" className="hidden rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-300 sm:inline-flex">
                    <FiActivity className="h-4 w-4" />
                  </Link>
                  <a href="https://github.com/KyrieChao" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" className="hidden rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-300 md:inline-flex">
                    <FiGithub className="h-4 w-4" />
                  </a>
                  <a href="https://huggingface.co/spaces/KyrieChao/code-method-namer" target="_blank" rel="noopener noreferrer" aria-label="Code Method Namer" title="Code Method Namer" className="hidden rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-300 md:inline-flex">
                    <FiCode className="h-4 w-4" />
                  </a>
                  <Search />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="mx-auto w-full max-w-[1360px] flex-grow px-5 py-4 sm:px-8 xl:px-12">{children}</main>
            <footer className="mt-10 border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              © {new Date().getFullYear()} KyrieChao. Powered by Next.js & GitHub Pages.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
