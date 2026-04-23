import { proxyApi } from "@/lib/server-api";

export async function POST(request: Request) {
  const formData = await request.formData();
  return proxyApi("/ingestion/upload", {
    method: "POST",
    body: formData,
  });
}
