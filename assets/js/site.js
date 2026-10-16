// The little JavaScript this site has. Every page works without it: each
// link here has a real address, and the script only makes it smoother.
//
// - On the homepage, the logo scrolls back to the top instead of reloading.
// - In the screenshot viewer, Back returns to the homepage exactly where the
//   reader left it (history.back(), so the browser restores the scroll
//   position), Previous and Next replace the current viewer page instead of
//   piling up history, and the arrow keys and Escape do the same as the
//   buttons.
//
// The only thing it keeps is a note in sessionStorage: whether the viewer
// was opened from the homepage, and which screenshot was looked at last. It
// never leaves the browser and is gone when the tab closes.

(() => {
  const FROM_HOME = "lexicora:viewer-from-home";
  const LAST_SHOT = "lexicora:viewer-last";

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
    remove(key) {
      try {
        sessionStorage.removeItem(key);
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

  const onHomepage = location.pathname === "/" || location.pathname === "/index.html";

  // ---------- Logo: back to the top ----------

  if (onHomepage) {
    for (const brand of document.querySelectorAll("a.brand")) {
      brand.addEventListener("click", (event) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        // Drops a #section left in the address by an earlier jump.
        if (location.hash) history.replaceState(history.state, "", location.pathname);
        scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
      });
    }

    // Coming back from the viewer after Previous or Next, the browser
    // restores the scroll position of the screenshot that was opened, not
    // the one looked at last. If that one is out of view, bring it in.
    // pagereveal runs before the first frame (and before a view transition
    // takes its snapshot); pageshow is the fallback.
    const revealLastShot = () => {
      const id = storage.get(LAST_SHOT);
      storage.remove(LAST_SHOT);
      const shot = id && document.getElementById(id);
      if (!shot) return;
      const box = shot.getBoundingClientRect();
      const visible = box.bottom > 0 && box.top < innerHeight;
      if (!visible) shot.scrollIntoView({ block: "center", behavior: "instant" });
    };
    addEventListener("onpagereveal" in window ? "pagereveal" : "pageshow", revealLastShot);
    return;
  }

  // ---------- Screenshot viewer ----------

  const back = document.querySelector("[data-viewer-back]");
  if (!back) return;

  const prev = document.querySelector('.viewer a[rel="prev"]');
  const next = document.querySelector('.viewer a[rel="next"]');
  const shotId = back.hash.slice(1); // "screenshot-3", from the Back link

  // How this page was reached decides what Back can do.
  let referrer = null;
  try {
    referrer = document.referrer ? new URL(document.referrer) : null;
  } catch {}
  const sameSite = referrer?.origin === location.origin;
  if (sameSite && (referrer.pathname === "/" || referrer.pathname === "/index.html")) {
    storage.set(FROM_HOME, "1");
  } else if (!(sameSite && referrer.pathname.startsWith("/screenshots/"))) {
    // Opened directly, or from elsewhere: there is no homepage to go back to.
    storage.remove(FROM_HOME);
  }
  if (shotId) storage.set(LAST_SHOT, shotId);

  const goBack = () => {
    if (storage.get(FROM_HOME) && history.length > 1) {
      storage.remove(FROM_HOME);
      history.back();
    } else {
      storage.remove(LAST_SHOT);
      location.href = back.href;
    }
  };

  const go = (link) => {
    if (link) location.replace(link.href);
  };

  back.addEventListener("click", (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    goBack();
  });

  for (const link of [prev, next]) {
    link?.addEventListener("click", (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      go(link);
    });
  }

  addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (event.key === "ArrowLeft") go(prev);
    else if (event.key === "ArrowRight") go(next);
    else if (event.key === "Escape") goBack();
    else return;
    event.preventDefault();
  });
})();
