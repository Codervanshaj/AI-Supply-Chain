import { proxyApi } from "@/lib/server-api";

export async function POST(request: Request) {
  const body = await request.text();
  return proxyApi("/ingestion/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}
