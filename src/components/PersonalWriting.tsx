import Image from "next/image";

const images = [
  {
    src: "/images/1.png",
    alt: "红白色跑道上的行人与海报",
    note: "过马路时，每个人都在自己的节奏里向前。",
  },
  {
    src: "/images/2.png",
    alt: "咖啡与社交主题海报",
    note: "咖啡、交谈和停留，被放进同一张画面。",
  },
  {
    src: "/images/3.png",
    alt: "路灯与明信片设计",
    note: "雾今天来得很早，路灯亮了一整天。真希望你也在这里。",
  },
  {
    src: "/images/4.png",
    alt: "红色品牌视觉设计",
    note: "一张名片，试着用颜色和留白留下印象。",
  },
];

export function PersonalWriting() {
  return (
    <section className="border-y border-stone-200 py-8 dark:border-gray-800 sm:py-10">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-gray-100">
          图像与片语
        </h2>
      </div>
      <div className="divide-y divide-stone-200 dark:divide-gray-800">
        {images.map(({ src, alt, note }, index) => (
          <figure
            key={src}
            className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] sm:items-center sm:gap-10 sm:py-7"
          >
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className={`relative block h-56 w-full overflow-hidden rounded-md bg-stone-100 dark:bg-gray-900 sm:h-72 lg:h-80 ${
                index % 2 === 1 ? "sm:order-2" : ""
              }`}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 640px) 90vw, 55vw"
                className="object-contain"
              />
            </a>
            <figcaption className={index % 2 === 1 ? "sm:order-1 sm:pl-6" : "sm:pr-6"}>
              <span className="font-mono text-xs tracking-[0.16em] text-gray-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 max-w-md text-base leading-7 text-gray-700 dark:text-gray-300">
                {note}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
