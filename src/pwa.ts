import { registerSW } from 'virtual:pwa-register';

async function clearDevServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
  if (!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
}

if (import.meta.env.DEV) {
  // Old navigateFallback shells stick across reloads and break ES↔EN in local testing.
  void clearDevServiceWorkers();
} else {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      void registration?.update();
    },
  });
}
