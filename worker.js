const SESSION_COOKIE = "optes_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function createSession(payload, secret) {
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
  return encodedPayload + "." + base64UrlEncode(new Uint8Array(signature));
}

async function readSession(request, secret) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const entry = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(SESSION_COOKIE + "="));
  if (!entry) return null;

  const token = entry.slice(SESSION_COOKIE.length + 1);
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const key = await getHmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(parts[1]),
      new TextEncoder().encode(parts[0])
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    if (!payload || payload.v !== 1 || typeof payload.sub !== "string" ||
        typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function sessionCookie(value, maxAge = SESSION_TTL_SECONDS) {
  return SESSION_COOKIE + "=" + value +
    "; Path=/; Max-Age=" + maxAge +
    "; HttpOnly; Secure; SameSite=Lax";
}

async function handleGoogleLogin(request, env, url) {
  if (request.headers.get("Origin") !== url.origin) {
    return json({ error: "طلب غير مسموح." }, 403);
  }
  if (!env.GOOGLE_CLIENT_ID || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    return json({ error: "إعدادات تسجيل الدخول غير مكتملة على الخادم." }, 503);
  }
  if (Number(request.headers.get("Content-Length") || 0) > 20000) {
    return json({ error: "حجم الطلب كبير." }, 413);
  }

  let credential;
  try {
    const body = await request.json();
    credential = body && body.credential;
  } catch {
    return json({ error: "بيانات تسجيل الدخول غير صالحة." }, 400);
  }
  if (typeof credential !== "string" || credential.length < 100 || credential.length > 16000) {
    return json({ error: "لم يصل رمز Google صالح." }, 400);
  }

  let googleClaims;
  try {
    const verifyUrl = new URL(GOOGLE_TOKENINFO_URL);
    verifyUrl.searchParams.set("id_token", credential);
    const googleResponse = await fetch(verifyUrl, {
      headers: { "Accept": "application/json" },
      cf: { cacheTtl: 0, cacheEverything: false },
    });
    if (!googleResponse.ok) {
      return json({ error: "تعذّر التحقق من حساب Google. حاول مرة أخرى." }, 401);
    }
    googleClaims = await googleResponse.json();
  } catch {
    return json({ error: "تعذّر الاتصال بخدمة التحقق من Google." }, 502);
  }

  const issuerOk = googleClaims.iss === "accounts.google.com" ||
    googleClaims.iss === "https://accounts.google.com";
  const expiry = Number(googleClaims.exp);
  const verifiedEmail = googleClaims.email_verified === true ||
    googleClaims.email_verified === "true";

  if (!issuerOk || googleClaims.aud !== env.GOOGLE_CLIENT_ID ||
      !Number.isFinite(expiry) || expiry <= Math.floor(Date.now() / 1000) ||
      !verifiedEmail || typeof googleClaims.sub !== "string" ||
      typeof googleClaims.email !== "string") {
    return json({ error: "تعذّر اعتماد حساب Google. اختر حساباً صالحاً وحاول مجدداً." }, 401);
  }

  const now = Math.floor(Date.now() / 1000);
  const session = await createSession({
    v: 1,
    sub: googleClaims.sub,
    email: googleClaims.email,
    exp: now + SESSION_TTL_SECONDS,
  }, env.SESSION_SECRET);

  return json(
    { ok: true },
    200,
    { "Set-Cookie": sessionCookie(session) }
  );
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/auth/google" && request.method === "POST") {
    return handleGoogleLogin(request, env, url);
  }

  if (path === "/api/auth/session" && request.method === "GET") {
    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return json({ authenticated: false }, 503);
    const session = await readSession(request, env.SESSION_SECRET);
    return session
      ? json({ authenticated: true, email: session.email || null })
      : json({ authenticated: false }, 401);
  }

  if (path === "/api/auth/logout" && request.method === "POST") {
    if (request.headers.get("Origin") !== url.origin) {
      return json({ error: "طلب غير مسموح." }, 403);
    }
    return json(
      { ok: true },
      200,
      { "Set-Cookie": sessionCookie("", 0) }
    );
  }

  if (path.startsWith("/api/")) {
    return json({ error: "المسار غير موجود." }, 404);
  }

  const isHtmlPage = path === "/" || path.toLowerCase().endsWith(".html");
  const isLoginPage = path === "/" || path === "/index.html";
  if (isHtmlPage) {
    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
      return new Response("إعدادات الجلسة غير مكتملة على الخادم.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
    const session = await readSession(request, env.SESSION_SECRET);
    if (isLoginPage && session) {
      return Response.redirect(new URL("/home.html", url.origin), 302);
    }
    if (!isLoginPage && !session) {
      return Response.redirect(new URL("/index.html", url.origin), 302);
    }
  }

  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch {
      return json({ error: "حدث خطأ غير متوقع. حاول مرة أخرى." }, 500);
    }
  },
};
