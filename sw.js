/* LotQuote CRM — the service worker, for push notifications only.
 * It doesn't cache anything or touch page loads: it shows a notification
 * when one arrives, and a tap opens the CRM on the account it's about. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch (_) {
    d = { title: "LotQuote", body: e.data ? e.data.text() : "" };
  }
  e.waitUntil(
    self.registration.showNotification(d.title || "LotQuote", {
      body: d.body || "",
      tag: d.tag,
      icon: "apple-touch-icon.png",
      badge: "favicon.png",
      data: { url: d.url || "./" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(
    (async () => {
      const open = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of open) {
        if ("focus" in c) {
          await c.focus();
          c.postMessage({ type: "lq-open", url });
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
