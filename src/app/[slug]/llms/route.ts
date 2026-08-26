import {
  LLMS_TXT_RESPONSE_HEADERS,
  renderStoreLlmsTxt,
} from "@/lib/seo/render-llms-txt";

export const revalidate = 600;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const body = await renderStoreLlmsTxt(slug);

  if (!body) {
    return new Response("Mağaza bulunamadı.", {
      status: 404,
      headers: LLMS_TXT_RESPONSE_HEADERS,
    });
  }

  return new Response(body, { headers: LLMS_TXT_RESPONSE_HEADERS });
}
