# lexicora.github.io

Homepage for the [Lexicora browser extension](https://github.com/lexicora/lexicora-extension): the landing page, store links, privacy policy, licence and changelog.

Plain HTML and CSS, no JavaScript, no build step, no dependencies. Light and dark follow the system via `prefers-color-scheme`, using the same colour tokens, fonts (Wix Madefor Text, JetBrains Mono) and logo as the extension.

Page navigation is smoothed with cross-document view transitions (`@view-transition` in the CSS): the regular cross-fade, the same on every page, with the header held in place. Jumps within a page scroll smoothly; arriving on a page at an anchor does not, since smooth scrolling is switched off while a transition runs (`html:active-view-transition`). Browsers without support just navigate normally, as do users who prefer reduced motion.

## Layout

| Path | What |
| --- | --- |
| `index.html` | Landing page |
| `privacy/` | Privacy policy, mirrors `PRIVACY.md` in the extension repository |
| `license/` | Lexicora Extension License, mirrors `LICENSE.txt` |
| `changelog/` | Release notes, mirrors `src/constants/changelog.ts` |
| `screenshots/1/` to `5/` | One viewer page per screenshot; back and previous/next sit at the top right |
| `404.html` | Not-found page (GitHub Pages serves it automatically) |
| `assets/css/style.css` | All styling |
| `assets/img/screenshots/` | Store screenshots from `docs/store/screenshots` at 800, 1600 and 2400 px, as JPEG XL (`.jxl`) with a JPEG fallback in each `<picture>` |
| `assets/icons/` | Chrome, Edge and Firefox glyphs from [Simple Icons](https://simpleicons.org) (CC0). The brands are trademarks of their owners |
| `assets/fonts/`, `assets/logos/` | Fonts (SIL OFL, licences alongside) and logos from the extension |

## Preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Paths are root-relative, so the site needs to be served from `/`, as it is on GitHub Pages.

## Keeping it in step with the extension

The privacy policy, licence, changelog and screenshot captions are copies. When `PRIVACY.md`, `LICENSE.txt` or the changelog change in the extension repository, update the matching page here (and `assets/LICENSE.txt`). Store URLs appear in `index.html` (hero, install section) and nowhere else.

## Regenerating images

JPEG XL needs `cjxl` (`brew install jpeg-xl`). From the 2400 px originals in the extension repository:

```sh
cjxl 2.png assets/img/screenshots/2-2400.jxl -d 1.0 -e 7   # also at 1600 and 800 px, resized first
sips -s format jpeg -s formatOptions 82 -Z 1600 2.png --out assets/img/screenshots/2-1600.jpg
```

External links carry `target="_blank" rel="noopener noreferrer"`; keep that when adding links.
