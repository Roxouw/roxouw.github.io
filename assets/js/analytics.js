(function () {
  "use strict";

  const GA_ID = "G-57VS8P14FH";
  const DATA_LAYER_NAME = "dataLayer";

  if (!GA_ID || window.__analyticsLoaderStarted) return;
  window.__analyticsLoaderStarted = true;

  window[DATA_LAYER_NAME] = window[DATA_LAYER_NAME] || [];

  function gtag() {
    window[DATA_LAYER_NAME].push(arguments);
  }

  if (typeof window.gtag !== "function") {
    window.gtag = gtag;
  }

  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { transport_type: "beacon" });

  function injectAnalytics() {
    if (document.querySelector('script[data-analytics="gtag"]')) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    script.dataset.analytics = "gtag";
    script.onerror = function () {
      window.__analyticsLoadFailed = true;
    };
    document.head.appendChild(script);
  }

  function scheduleLoad() {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(injectAnalytics, { timeout: 2500 });
      return;
    }

    window.setTimeout(injectAnalytics, 1500);
  }

  if (document.readyState === "complete") {
    scheduleLoad();
  } else {
    window.addEventListener("load", scheduleLoad, { once: true });
  }
})();
