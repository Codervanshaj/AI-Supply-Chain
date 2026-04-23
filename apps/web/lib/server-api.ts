const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function proxyApi(path: string, init?: RequestInit) {
  try {
    const headers = new Headers(init?.headers);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    const bodyText = await response.text();

    return new Response(bodyText, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `Proxy request to ${path} failed.`;
    return Response.json(
      {
        data: null,
        errors: [{ code: "proxy_error", message }],
      },
      { status: 502 },
    );
  }
}
