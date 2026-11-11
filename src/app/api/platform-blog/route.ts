import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import {
  createAutomationBlogPost,
  isAutomationAuthorized,
  type AutomationPostInput,
} from "@/lib/blog/platform-blog-automation";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { revalidateSitemap } from "@/lib/seo/sitemap-cache";

/**
 * Otomasyon kanalı — zamanlanmış görev / dış araç buraya yazı gönderir.
 * Yetki: Authorization: Bearer <BLOG_AUTOMATION_TOKEN>
 * Varsayılan olarak TASLAK kaydeder; yayinda:true gönderilmedikçe canlıya çıkmaz.
 */
export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  let body: AutomationPostInput;
  try {
    body = (await request.json()) as AutomationPostInput;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const result = await createAutomationBlogPost(body);

  if (!result.ok) {
    logDukkanAction("platformBlogAutomation", "yazı kaydedilemedi", {
      error: result.error,
    });
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  revalidatePath("/yonetim/admin/blog");

  if (result.post.yayinda) {
    revalidatePath("/blog");
    revalidatePath(`/blog/${result.post.slug}`);
    revalidateSitemap();
  }

  logDukkanAction("platformBlogAutomation", "yazı kaydedildi", {
    slug: result.post.slug,
    yayinda: String(result.post.yayinda),
  });

  return NextResponse.json(
    {
      id: result.post.id,
      slug: result.post.slug,
      slug_degisti: result.slugChanged,
      yayinda: result.post.yayinda,
      url: `/blog/${result.post.slug}`,
      duzenle_url: `/yonetim/admin/blog/${result.post.id}/duzenle`,
    },
    { status: 201 }
  );
}
