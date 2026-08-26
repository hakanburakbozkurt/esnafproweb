import {
  LLMS_TXT_RESPONSE_HEADERS,
  renderRootLlmsTxt,
} from "@/lib/seo/render-llms-txt";

export const revalidate = 600;

export async function GET() {
  const body = await renderRootLlmsTxt();

  return new Response(body, { headers: LLMS_TXT_RESPONSE_HEADERS });
}
