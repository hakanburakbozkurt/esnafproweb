import { getPublicBlogPostBySlug } from "@/lib/blog/public-blog-posts";
import { notFound, permanentRedirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Eski /blog/[slug] linkleri mağaza canonical URL'sine kalıcı yönlendirilir. */
export default async function BlogPostRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  permanentRedirect(`/${post.shop_slug}/blog/${post.slug}`);
}
