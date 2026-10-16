# lexicora.github.io

Homepage for the [Lexicora browser extension](https://github.com/lexicora/lexicora-extension): the landing page, store links, privacy policy, licence and changelog.

Plain HTML and CSS, no JavaScript, no build step, no dependencies. Light and dark follow the system via `prefers-color-scheme`, using the same colour tokens, fonts (Wix Madefor Text, JetBrains Mono) and logo as the extension.

## Layout

| Path | What |
| --- | --- |
| `index.html` | Landing page |
| `privacy/` | Privacy policy, mirrors `PRIVACY.md` in the extension repository |
| `license/` | Lexicora Extension License, mirrors `LICENSE.txt` |
| `changelog/` | Release notes, mirrors `src/constants/changelog.ts` |
| `404.html` | Not-found page (GitHub Pages serves it automatically) |
| `assets/css/style.css` | All styling |
| `assets/img/screenshots/` | Store screenshots from `docs/store/screenshots`, resized to 800 and 1600 px JPEG |
| `assets/fonts/`, `assets/logos/` | Fonts (SIL OFL, licences alongside) and logos from the extension |

## Preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Paths are root-relative, so the site needs to be served from `/`, as it is on GitHub Pages.

## Keeping it in step with the extension

The privacy policy, licence and changelog are copies. When `PRIVACY.md`, `LICENSE.txt` or the changelog change in the extension repository, update the matching page here (and `assets/LICENSE.txt`). Store URLs appear in `index.html` (hero, install section) and nowhere else.
