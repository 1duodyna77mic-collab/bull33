/* Wilberthub compatibility loader: keep the original engine, but force its service worker onto this origin. */
(function () {
  const originalRegister = navigator.serviceWorker && navigator.serviceWorker.register
    ? navigator.serviceWorker.register.bind(navigator.serviceWorker)
    : null;

  if (originalRegister) {
    navigator.serviceWorker.register = function (scriptURL, options) {
      try {
        const url = new URL(scriptURL, location.href);
        if (url.pathname.endsWith('/sw.js') || url.origin !== location.origin) {
          return originalRegister(new URL('/sw.js', location.origin).href, options);
        }
      } catch (_) {}
      return originalRegister(scriptURL, options);
    };
  }

  window.assetsBase = 'https://cdn.jsdelivr.net/gh/TongSherbet/storage/';

  const script = document.createElement('script');
  script.src = 'https://raw.githubusercontent.com/TongSherbet/storage/main/loader.js';
  script.async = false;
  script.onerror = function () {
    document.documentElement.dataset.wilberthubLoaderError = '1';
  };
  document.head.appendChild(script);
})();
