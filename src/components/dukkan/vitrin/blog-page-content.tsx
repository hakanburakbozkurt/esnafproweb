import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { BlogPostCard } from "@/components/landing/blog-post-card";
import { VitrinDotGrid } from "@/components/dukkan/vitrin/vitrin-open-section";
import { vitrinSubpageContainerClass } from "@/lib/utils/layout";
import type { DukkanBlogYazisi } from "@/types/database.types";

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
            {isOwner && (
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/yonetim/blog/yeni"
                  className="inline-flex min-h-10 items-center rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 px-5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:shadow-emerald-500/30"
                >
                  Yeni Yazı Ekle
                </Link>
                <Link
                  href="/yonetim/blog"
                  className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  Yazıları Yönet
                </Link>
              </div>
            )}
          </header>
        </ScrollReveal>

        {posts.length === 0 ? (
          <ScrollReveal className="mt-10">
            {isOwner ? (
              <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 p-6 shadow-sm sm:p-8">
                <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                  🚀{" "}
                  <span className="font-semibold text-slate-900">
                    Yapay Zeka ve Google Aramalarında Öne Çık!
                  </span>{" "}
                  Henüz hiç blog yazısı eklemedin. Bölgesindeki müşterilerin seni Google ve
                  ChatGPT aramalarında daha rahat bulabilmesi için hemen ilk yazını oluştur ve
                  görünürlüğünü katla!
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
                  <BlogPostCard
                    post={{
                      ...post,
                      shop_slug: shopSlug,
                      shop_name: shopName,
                    }}
                    showShopName={false}
                  />
                </li>
              </ScrollReveal>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
