export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Enforce HTTPS
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

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

    // SEO specific headers for robots.txt & sitemap.xml
    if (url.pathname === "/robots.txt") {
      resHeaders.set("Content-Type", "text/plain; charset=utf-8");
      resHeaders.set("Cache-Control", "public, max-age=86400");
    } else if (url.pathname === "/sitemap.xml") {
      resHeaders.set("Content-Type", "application/xml; charset=utf-8");
      resHeaders.set("Cache-Control", "public, max-age=86400");
    }

    // Security & referrer headers
    resHeaders.set("X-Content-Type-Options", "nosniff");
    resHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders
    });
  }
};

