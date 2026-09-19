/* Wilberto UI loader: keep the real Opium interface, rename its visible branding, polish it, and suppress advertising. */
(function () {
  const originalRegister = navigator.serviceWorker && navigator.serviceWorker.register
    ? navigator.serviceWorker.register.bind(navigator.serviceWorker) : null;
  if (originalRegister) {
    navigator.serviceWorker.register = function (scriptURL, options) {
      try {
        const url = new URL(scriptURL, location.href);
        if (url.pathname.endsWith('/sw.js') || url.origin !== location.origin)
          return originalRegister(new URL('./sw.js', location.href).href, options);
      } catch (_) {}
      return originalRegister(scriptURL, options);
    };
  }

  window.assetsBase = 'https://cdn.jsdelivr.net/gh/TongSherbet/storage/';

  let opiumRoot = null;
  const nativeAttachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    const root = nativeAttachShadow.call(this, init);
    opiumRoot = root;
    return root;
  };

  const adHost = /(^|\.)(doubleclick\.net|googlesyndication\.com|googleadservices\.com|adservice\.google\.com|amazon-adsystem\.com|adskeeper\.com|taboola\.com|outbrain\.com)(\/|$)/i;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    try {
      const url = new URL(typeof input === 'string' ? input : input.url, location.href);
      if (adHost.test(url.hostname)) return Promise.resolve(new Response('', {status:204}));
    } catch (_) {}
    return nativeFetch(input, init);
  };

  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    try {
      const u = new URL(url, location.href);
      if (adHost.test(u.hostname))
        return nativeOpen.call(this, method, location.href + '/__wilberto_ad_blocked__');
    } catch (_) {}
    return nativeOpen.apply(this, arguments);
  };

  const styleWilberto = (root) => {
    if (!root || root.querySelector('#wilberto-polish')) return;
    const style = document.createElement('style');
    style.id = 'wilberto-polish';
    style.textContent = `
      :host, :host * { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important; box-sizing:border-box; }
      :host { color-scheme:dark !important; }
      html,body { background:radial-gradient(900px 520px at 12% -5%,rgba(168,85,247,.20),transparent 60%),radial-gradient(850px 500px at 95% 100%,rgba(124,58,237,.18),transparent 62%),#090510 !important;color:#f7f1ff !important; }
      button,input,textarea,select { font:inherit !important; }
      button,.icon-btn,.nav-item,.action-btn { border-radius:12px !important; transition:background .15s ease,border-color .15s ease,box-shadow .15s ease,transform .15s ease !important; }
      button:hover,.icon-btn:hover,.nav-item:hover,.action-btn:hover { background:rgba(168,85,247,.16) !important;border-color:rgba(216,180,254,.42) !important;box-shadow:0 0 22px rgba(168,85,247,.16) !important; }
      input,textarea,select { color:#fff !important;background:rgba(17,7,29,.82) !important;border-color:rgba(216,180,254,.24) !important;border-radius:12px !important; }
      input:focus,textarea:focus,select:focus { outline:none !important;border-color:rgba(192,132,252,.70) !important;box-shadow:0 0 0 3px rgba(168,85,247,.13),0 0 24px rgba(168,85,247,.12) !important; }
      a { color:#d8b4fe !important; } ::selection { background:rgba(168,85,247,.40) !important;color:#fff !important; }
    `;
    root.appendChild(style);

    const rename = () => {
      root.querySelectorAll('*').forEach(el => {
        if (el.childElementCount === 0 && el.textContent.trim() === 'Opium') el.textContent = 'Wilberto';
        ['title','aria-label','placeholder'].forEach(a => {
          const v = el.getAttribute(a);
          if (v && /\bOpium\b/i.test(v)) el.setAttribute(a, v.replace(/\bOpium\b/gi,'Wilberto'));
        });
      });
      root.querySelectorAll('title').forEach(t => { if (/\bOpium\b/i.test(t.textContent)) t.textContent = t.textContent.replace(/\bOpium\b/gi,'Wilberto'); });
    };

    const isAd = el => {
      if (!el || el.nodeType !== 1) return false;
      const attrs = [el.id||'', typeof el.className === 'string' ? el.className : '', el.getAttribute('data-ad')||'', el.getAttribute('data-ad-slot')||'', el.getAttribute('aria-label')||'', el.getAttribute('title')||''].join(' ');
      if (/\bad[-_ ]?(container|slot|banner|unit)\b|advertisement|sponsored|ads?[-_ ]?(by|container|banner|slot|wrapper)|ad[-_ ]?choices/i.test(attrs)) return true;
      if (el.tagName === 'IFRAME') {
        try { if (adHost.test(new URL(el.getAttribute('src')||'',location.href).hostname)) return true; } catch (_) {}
      }
      return false;
    };
    const clean = () => { rename(); root.querySelectorAll('*').forEach(el => { if (isAd(el)) el.remove(); }); };
    clean();
    new MutationObserver(clean).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['id','class','src','data-ad','data-ad-slot','aria-label','title']});
  };

  const wait = () => { if (opiumRoot) styleWilberto(opiumRoot); else setTimeout(wait,50); };
  const script = document.createElement('script');
  script.src = 'https://raw.githubusercontent.com/TongSherbet/storage/main/loader.js';
  script.async = false;
  script.onload = wait;
  script.onerror = () => { document.documentElement.dataset.wilberthubLoaderError='1'; };
  document.head.appendChild(script);
})();