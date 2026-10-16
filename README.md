# lexicora.github.io

Homepage for the [Lexicora browser extension](https://github.com/lexicora/lexicora-extension): the landing page, store links, privacy policy, licence and changelog.

Plain HTML and CSS, no JavaScript, no build step, no dependencies. Light and dark follow the system via `prefers-color-scheme`, using the same colour tokens, fonts (Wix Madefor Text, JetBrains Mono) and logo as the extension.

Page navigation is smoothed with cross-document view transitions (`@view-transition` in the CSS): the regular cross-fade, the same on every page, with the header held in place. Jumps within a page scroll smoothly; arriving on a page at an anchor does not, since smooth scrolling is switched off while a transition runs (`html:active-view-transition`). Browsers without support just navigate normally, as do users who prefer reduced motion.

## Layout

| Path | What |
| --- | --- |
| `index.html` | Landing page: hero, the four steps (capture, organise, find, keep) each beside the screen it happens on, details, shortcuts, privacy, principles, roadmap, install |
| `privacy/` | Privacy policy, mirrors `PRIVACY.md` in the extension repository |
| `license/` | Lexicora Extension License, mirrors `LICENSE.txt` |
| `changelog/` | Release notes, mirrors `src/constants/changelog.ts` |
| `screenshots/1/` to `5/` | One viewer page per screenshot; back and previous/next sit at the top right |
| `404.html` | Not-found page (GitHub Pages serves it automatically) |
| `assets/css/style.css` | All styling |
| `assets/img/product/` | The landing page's product shots: the browser window or side panel cut out of each store screenshot, without its headline. AVIF, JPEG XL and JPEG, made by `scripts/product-shots.sh` |
| `assets/img/screenshots/` | The store screenshots themselves, from `docs/store/screenshots` at 800, 1600 and 2400 px, as JPEG XL with a JPEG fallback. Used by the viewer pages |
| `assets/img/og.jpg` | The 1200 × 630 social preview card, rendered from `scripts/og.html` |
| `assets/icons/` | Chrome, Edge, Firefox and GitHub glyphs from [Simple Icons](https://simpleicons.org) (CC0). The brands are trademarks of their owners |
| `assets/icons/ui/` | Interface icons from [Lucide](https://lucide.dev) (ISC, licence alongside), the set the extension uses, exported from its `lucide-react` |
| `scripts/` | Tools for regenerating images, not part of the site |
| `assets/fonts/`, `assets/logos/` | Fonts (SIL OFL, licences alongside) and logos from the extension |

## Preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Paths are root-relative, so the site needs to be served from `/`, as it is on GitHub Pages.

## Keeping it in step with the extension

The privacy policy, licence, changelog and screenshot captions are copies. When `PRIVACY.md`, `LICENSE.txt` or the changelog change in the extension repository, update the matching page here (and `assets/LICENSE.txt`). Store URLs appear in `index.html` (hero, install section) and nowhere else.

On a release, `index.html` names the version in three places: the "New in" pill (which links to the release's changelog entry), the line under the store buttons, and `softwareVersion` in the JSON-LD block.

The header and footer are the same on every page, written out in each. On the subpages, the header's Features and Install links point at `/#…` and Privacy at `/privacy/`, and the page's own link carries `aria-current="page"`.

## Regenerating images

Needs `cjxl` and `avifenc` (`brew install jpeg-xl libavif`); `sips` comes with macOS.

**Product shots.** When the store screenshots change, run from the repository root, with the extension checked out beside it:

```sh
scripts/product-shots.sh ../lexicora-extension
```

The crop boxes are at the bottom of the script. They assume the current layout of the store screenshots (window or panel in the same place), so check them when the screenshots are recomposed. Each `<picture>` offers AVIF, then JPEG XL, then JPEG.

**Store screenshots** (the viewer pages). From the 2400 px originals:

```sh
cjxl 2.png assets/img/screenshots/2-2400.jxl -d 1.0 -e 7   # also at 1600 and 800 px, resized first
sips -s format jpeg -s formatOptions 82 -Z 1600 2.png --out assets/img/screenshots/2-1600.jpg
```

**Social card.** `scripts/og.html` uses the site's own font, logo and capture shot. Render it with Chrome and save it as JPEG:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --allow-file-access-from-files --virtual-time-budget=3000 --window-size=1200,630 \
  --screenshot=/tmp/og.png "file://$PWD/scripts/og.html"
sips -s format jpeg -s formatOptions 85 /tmp/og.png --out assets/img/og.jpg
```

External links carry `target="_blank" rel="noopener noreferrer"`; keep that when adding links.
