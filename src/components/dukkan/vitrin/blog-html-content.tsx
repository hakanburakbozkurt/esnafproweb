import { sanitizeBlogHtml } from "@/lib/blog/blog-html";
import { cn } from "@/lib/utils/cn";

export function BlogHtmlContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safeHtml = sanitizeBlogHtml(html);
  if (!safeHtml) return null;

  return (
    <div
      className={cn("blog-prose max-w-none break-words", className)}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
