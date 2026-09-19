/* Wilbert Hub loader: run the real remote browser UI, then restyle its actual DOM. */
(function () {
  const originalRegister = navigator.serviceWorker && navigator.serviceWorker.register
    ? navigator.serviceWorker.register.bind(navigator.serviceWorker) : null;
  if (originalRegister) navigator.serviceWorker.register = function (scriptURL, options) {
    try {
      const url = new URL(scriptURL, location.href);
      if (url.pathname.endsWith('/sw.js') || url.origin !== location.origin)
        return originalRegister(new URL('./sw.js', location.href).href, options);
    } catch (_) {}
    return originalRegister(scriptURL, options);
  };

  window.assetsBase = 'https://cdn.jsdelivr.net/gh/TongSherbet/storage/';
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const response = await nativeFetch(input, init);
    try {
      const url = typeof input === 'string' ? input : input.url;
      if (url && /main\.html(?:[?#]|$)/i.test(url)) {
        const source = await response.clone().text();
        const patched = source
          .replace(/<title[^>]*>[^<]*<\/title>/i, '<title>Wilbert Hub Browser</title>')
          .replace(/(<[^>]*class=["'][^"']*wordmark[^"']*["'][^>]*>)[\s\S]*?(<\/[^>]+>)/i, '$1WILBERT BROWSER$2')
          .replace(/(<[^>]*class=["'][^"']*tagline[^"']*["'][^>]*>)[\s\S]*?(<\/[^>]+>)/i, '$1your browser, inside Wilbert Hub$2');
        return new Response(patched, {status:response.status,statusText:response.statusText,headers:response.headers});
      }
    } catch (_) {}
    return response;
  };

  const script = document.createElement('script');
  script.src = 'https://raw.githubusercontent.com/TongSherbet/storage/main/loader.js';
  script.async = false;
  script.onload = function () {
    const installUi = () => {
      const host = document.querySelector('*');
      const root = host && host.shadowRoot;
      if (!root) return setTimeout(installUi, 150);

      const style = document.createElement('style');
      style.textContent = `
        :host,html,body,*{font-family:"Trebuchet MS",system-ui,sans-serif!important}
        body{background:radial-gradient(circle at 15% 10%,rgba(168,85,247,.22),transparent 32%),radial-gradient(circle at 85% 85%,rgba(124,58,237,.20),transparent 38%),#08030f!important;color:#faf7ff!important}
        button,.icon-btn,.nav-item,.action-btn{color:#f5edff!important;border-radius:13px!important}
        button:hover,.icon-btn:hover,.nav-item:hover,.action-btn:hover{background:rgba(168,85,247,.18)!important;box-shadow:0 0 20px rgba(168,85,247,.18)!important}
        input{color:#fff!important;background:rgba(18,6,31,.78)!important;border-color:rgba(216,180,254,.28)!important}
        .wordmark{color:#f3e8ff!important;text-shadow:0 0 24px rgba(168,85,247,.3)!important}
        .tagline{color:#bda7ca!important}a{color:#d8b4fe!important}
      `;
      root.appendChild(style);

      const clean = () => {
        root.querySelectorAll('*').forEach(el => {
          const text=(el.textContent||'').trim();
          if (/discord|opium/i.test(text) && el.children.length < 4) el.style.display='none';
        });
        root.querySelectorAll('[title],[aria-label]').forEach(el => {
          const v=(el.getAttribute('title')||'')+' '+(el.getAttribute('aria-label')||'');
          if (/discord|opium/i.test(v)) el.style.display='none';
        });
      };
      clean();
      new MutationObserver(clean).observe(root,{subtree:true,childList:true,characterData:true});
    };
    installUi();
  };
  script.onerror = function () { document.documentElement.dataset.wilberthubLoaderError='1'; };
  document.head.appendChild(script);
})();