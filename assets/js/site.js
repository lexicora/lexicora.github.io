// The little JavaScript this site has. Every page works without it: each
// link here has a real address, and the script only makes it smoother.
//
// - On the homepage, the logo scrolls back to the top instead of reloading.
// - In the screenshot viewer, Back returns to the homepage in one step,
//   however many screenshots were paged through, by going back in history:
//   the browser then restores the homepage exactly as it was left, scroll
//   position included. The arrow keys page through and Escape goes back.
//
// Previous and Next stay ordinary links. Navigating from script instead
// (location.replace) loses the old page's snapshot, and the view transition
// starts from a white frame.
//
// To know how far back the homepage is, each viewer page records its depth
// (1 for a screenshot opened from the homepage, 2 after one Next, ...) in its
// own history entry, and hands it to the next one through sessionStorage.
// That note never leaves the browser and is gone when the tab closes.

(() => {
  const DEPTH = "lexicora:viewer-depth";

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const storage = {
    get(key) {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        sessionStorage.setItem(key, value);
      } catch {}
    },
  };

  /** A plain left click, not one meant to open a new tab or window. */
  const isPlainClick = (event) =>
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  const isHome = (path) => path === "/" || path === "/index.html";

  // ---------- Logo: back to the top ----------

  if (isHome(location.pathname)) {
    for (const brand of document.querySelectorAll("a.brand")) {
      brand.addEventListener("click", (event) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        // Drops a #section left in the address by an earlier jump.
        if (location.hash) history.replaceState(history.state, "", location.pathname);
        scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
      });
    }
    return;
  }

  // ---------- Screenshot viewer ----------

  const back = document.querySelector("[data-viewer-back]");
  if (!back) return;

  const prev = document.querySelector('.viewer a[rel="prev"]');
  const next = document.querySelector('.viewer a[rel="next"]');

  /** How many history steps back the homepage is; 0 when unknown. */
  let depth = 0;

  const start = () => {
    if (Number.isInteger(history.state?.viewerDepth)) {
      // A reload, or a return to this entry: it already knows.
      depth = history.state.viewerDepth;
    } else {
      let referrer = null;
      try {
        referrer = document.referrer ? new URL(document.referrer) : null;
      } catch {}
      const sameSite = referrer?.origin === location.origin;
      if (sameSite && isHome(referrer.pathname)) {
        depth = 1;
      } else if (sameSite && referrer.pathname.startsWith("/screenshots/")) {
        const before = Number(storage.get(DEPTH));
        depth = before > 0 ? before + 1 : 0;
      }
      history.replaceState({ ...history.state, viewerDepth: depth }, "");
    }
    storage.set(DEPTH, String(depth));
  };

  // A page the browser prerendered (see the speculation rules) runs this
  // only once it is actually shown. Coming back to a page kept in the
  // back/forward cache, hand on that entry's depth again.
  if (document.prerendering) {
    document.addEventListener("prerenderingchange", start, { once: true });
  } else {
    start();
  }
  addEventListener("pageshow", (event) => {
    if (event.persisted) storage.set(DEPTH, String(depth));
  });

  const goBack = () => {
    if (depth > 0 && history.length > depth) history.go(-depth);
    else location.href = back.href;
  };

  back.addEventListener("click", (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    goBack();
  });

  addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (event.key === "ArrowLeft" && prev) prev.click();
    else if (event.key === "ArrowRight" && next) next.click();
    else if (event.key === "Escape") goBack();
    else return;
    event.preventDefault();
  });
})();
