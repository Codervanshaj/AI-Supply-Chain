import { proxyApi } from "@/lib/server-api";

export async function POST() {
  return proxyApi("/forecast/run", {
    method: "POST",
  });
}
