const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /growth/
Disallow: /growth/*

Sitemap: https://taymahhendi.com/sitemap.xml
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://taymahhendi.com/</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://taymahhendi.com/assets/artwork.jpg</image:loc>
      <image:title>Zero To 40 single cover artwork — Taymah Hendi</image:title>
      <image:caption>Official cover artwork for Zero To 40 by London artist Taymah Hendi</image:caption>
    </image:image>
    <image:image>
      <image:loc>https://taymahhendi.com/assets/portrait.jpg</image:loc>
      <image:title>Taymah Hendi portrait in Shoreditch London</image:title>
      <image:caption>London R&amp;B singer-songwriter Taymah Hendi</image:caption>
    </image:image>
  </url>
</urlset>
`;

const INDEXNOW_KEY = "f478a2e684074bd5a9bf517178de3d0f";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Enforce HTTPS
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // Direct SEO endpoints
    if (url.pathname === "/robots.txt") {
      return new Response(ROBOTS_TXT, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

    if (url.pathname === "/sitemap.xml") {
      return new Response(SITEMAP_XML, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

    if (url.pathname === `/${INDEXNOW_KEY}.txt`) {
      return new Response(INDEXNOW_KEY, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400"
        }
      });
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
