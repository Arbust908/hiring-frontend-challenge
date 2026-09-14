type GraphQLResponse<T> = {
  data?: T | null;
  errors?: { message: string }[];
};

export async function requestGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<{ data: T | null | undefined; serverTimeMs: number | null; receivedAtMs: number }> {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
  if (!endpoint) throw new Error("NEXT_PUBLIC_GRAPHQL_API_URL is not configured");

  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new Error("GraphQL request timed out")),
    10_000,
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`GraphQL API request failed (HTTP ${response.status})`);
    const responseText = await response.text();
    let payload: GraphQLResponse<T> | null;
    try {
      payload = JSON.parse(responseText);
    } catch {
      throw new Error(`GraphQL API returned invalid JSON (HTTP ${response.status})`);
    }
    if (payload?.errors?.length) {
      throw new Error(`GraphQL query failed: ${payload.errors.map((error) => error.message).join("; ")}`);
    }
    const serverTime = Date.parse(response.headers.get("Date") ?? "");
    return {
      data: payload?.data,
      serverTimeMs: Number.isFinite(serverTime) ? serverTime : null,
      receivedAtMs: Date.now(),
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
