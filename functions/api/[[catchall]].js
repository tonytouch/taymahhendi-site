export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = new URL(url.pathname + url.search, "https://growth.tonysplace.co.uk");

  const reqHeaders = new Headers(context.request.headers);
  reqHeaders.set("Host", "growth.tonysplace.co.uk");
  reqHeaders.set("X-Forwarded-Host", url.host);
  reqHeaders.set("X-Forwarded-Proto", "https");

  const response = await fetch(targetUrl.toString(), {
    method: context.request.method,
    headers: reqHeaders,
    body: ["GET", "HEAD"].includes(context.request.method) ? undefined : context.request.body,
    redirect: "manual"
  });

  const resHeaders = new Headers(response.headers);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: resHeaders
  });
}
