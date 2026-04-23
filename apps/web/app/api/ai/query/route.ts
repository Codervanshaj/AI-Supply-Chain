import { proxyApi } from "@/lib/server-api";

export async function POST(request: Request) {
  const body = await request.text();
  return proxyApi("/ai/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}
