export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, "https://taymahhendi-site.pages.dev");

    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("Host", "taymahhendi-site.pages.dev");
    reqHeaders.set("X-Forwarded-Host", url.host);
    reqHeaders.set("X-Forwarded-Proto", "https");

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: reqHeaders,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual"
    });

    const resHeaders = new Headers(response.headers);
    const location = resHeaders.get("Location");
    if (location && location.startsWith("https://taymahhendi-site.pages.dev")) {
      resHeaders.set("Location", location.replace("https://taymahhendi-site.pages.dev", "https://" + url.host));
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders
    });
  }
};
