export const upstreamRequestTimeoutMs = 8000;

export function withRequestTimeout(init: RequestInit = {}, timeoutMs = upstreamRequestTimeoutMs): RequestInit {
  if (init.signal) return init;
  return { ...init, signal: AbortSignal.timeout(timeoutMs) };
}
