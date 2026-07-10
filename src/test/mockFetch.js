export function jsonResponse(
  data,
  { ok = true, status = 200, statusText = "OK", contentType = "application/json" } = {},
) {
  return {
    ok,
    status,
    statusText,
    headers: {
      get: (name) =>
        name.toLowerCase() === "content-type" ? contentType : null,
    },
    json: async () => data,
  };
}
