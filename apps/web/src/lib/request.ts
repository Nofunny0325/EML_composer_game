export async function readJsonBody(req: Request, maxBytes = 32_000) {
  const contentLength = Number(req.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  try {
    return await req.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
}

