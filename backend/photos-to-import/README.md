# Drop your real photos here, then run:

```powershell
npm run import:photos           # preview what matches (safe, uploads nothing)
npm run import:photos:apply     # upload + attach
```

Each file is uploaded to the media library and attached to the matching record.

## File naming

Extension is ignored, case does not matter, spaces/`_` become `-`.

| File name | Attaches to |
| --- | --- |
| `aluminum-sliding-window.jpg` | product "Aluminum Sliding Window" cover |
| `product-aluminum-sliding-window.jpg` | same thing, explicit form |
| `service-interior-decoration.jpg` | service "Interior Decoration" cover |
| `project-commercial-showroom-glass-facade.jpg` | project cover |
| `gallery-aluminum-sliding-window-2.jpg` | gallery image #2 of that product |
| `hero-1.jpg` ... `hero-8.jpg` | background of homepage hero slide 1..8 |

### Current slugs

**Products** - `aluminum-sliding-window`, `upvc-casement-window`, `aluminum-casement-door`,
`frameless-glass-door`, `toughened-glass-panel`, `frosted-glass-sheet`, `aluminum-profiles`,
`aluminum-composite-panel`, `office-glass-partition`, `sliding-folding-partition`,
`decorative-wall-panel`, `gypsum-ceiling-design`, `custom-window-fabrication`, `custom-glass-railing`

**Services** - `aluminum-fabrication`, `window-installation`, `glass-installation`,
`custom-window-design`, `custom-door-design`, `glass-partition-installation`,
`office-glass-solutions`, `shower-glass-solutions`, `interior-decoration`, `custom-fabrication`

**Projects** - `modern-residential-window-upgrade`, `corporate-office-glass-partition`,
`aluminum-door-installation-project`, `luxury-home-floor-to-ceiling-windows`,
`commercial-showroom-glass-facade`, `apartment-building-aluminum-windows`,
`boutique-hotel-interior-decoration`

## Notes

- JPEG, PNG, WebP or GIF, up to `UPLOAD_MAX_MB` (5 MB by default) per file.
- Landscape photos work best for hero slides (1600px or wider).
- Anything that does not match a slug is reported and skipped - never guessed.
- The originals stay in this folder, so re-running is safe: it uploads a copy
  each time, so delete the file once it is attached if you do not want duplicates.
- `npm run` on Windows/PowerShell strips arguments starting with a dash, so to
  use options call node directly, e.g.
  `node scripts/import-photos.mjs --dir C:\my-photos apply`