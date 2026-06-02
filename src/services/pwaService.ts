export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(new URL("sw.js", window.location.href)).catch(() => undefined);
  });
}

export async function requestScreenWakeLock(): Promise<() => Promise<void>> {
  const wakeLock = "wakeLock" in navigator ? navigator.wakeLock : undefined;
  if (!wakeLock) {
    return async () => undefined;
  }

  try {
    const sentinel = await wakeLock.request("screen");
    return async () => {
      await sentinel.release().catch(() => undefined);
    };
  } catch {
    return async () => undefined;
  }
}
