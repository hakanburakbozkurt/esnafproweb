import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { vitrinSubpageContainerClass } from "@/lib/utils/layout";
import type { DukkanBlogYazisi } from "@/types/database.types";

function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function excerpt(text: string | null, max = 140) {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return "";
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export function BlogPageContent({
  shopName,
  shopSlug,
  posts,
  isOwner,
}: {
  shopName: string;
  shopSlug: string;
  posts: DukkanBlogYazisi[];
  isOwner: boolean;
}) {
  return (
    <div className="relative pb-16 pt-8 lg:pb-24 lg:pt-14">
      <VitrinDotGrid />

      <div className={vitrinSubpageContainerClass}>
        <ScrollReveal>
          <header className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {shopName}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-700 lg:text-4xl xl:text-5xl">
              Blog
            </h1>
          </header>
        </ScrollReveal>

        {posts.length === 0 ? (
          <ScrollReveal className="mt-10">
            {isOwner ? (
              <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 p-6 shadow-sm sm:p-8">
                <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                  🚀 <span className="font-semibold text-slate-900">Yapay Zeka ve Google Aramalarında Öne Çık!</span>{" "}
                  Henüz hiç blog yazısı eklemedin. Bölgesindeki müşterilerin seni Google ve ChatGPT
                  aramalarında daha rahat bulabilmesi için hemen ilk yazını oluştur ve görünürlüğünü
                  katla!
                </p>
                <Link
                  href="/yonetim/blog/yeni"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:scale-[1.02]"
                >
                  İlk Blog Yazını Şimdi Oluştur
                </Link>
              </div>
            ) : (
              <p className="rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 text-sm text-slate-500 sm:text-base">
                Henüz bu dükkana ait bir blog yazısı bulunmuyor.
              </p>
            )}
          </ScrollReveal>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {posts.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 0.05}>
                <li>
                  <Link
                    href={`/${shopSlug}/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      {post.kapak_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.kapak_url}
                          alt={post.baslik}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-emerald-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Blog
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <time className="text-xs font-medium text-slate-400">
                        {formatBlogDate(post.created_at)}
                      </time>
                      <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900 transition group-hover:text-emerald-700 sm:text-xl">
                        {post.baslik}
                      </h2>
                      {post.icerik && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                          {excerpt(post.icerik)}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
