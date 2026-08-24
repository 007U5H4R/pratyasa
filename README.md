# Pratyasa — patent IN 429867, on the record

A single static page presenting granted Indian patent **IN 429867** — a low-cost,
handheld electrochemical biosensor that detects endotoxin (LPS), a key sepsis
biomarker, at the point of care — together with the peer-reviewed *Langmuir* 2025
paper and footage of the working prototype.

No framework, no build step, no dependencies, no third-party requests, no analytics.
Just `index.html`, `styles.css`, `app.js`, and a web app manifest.

## Run locally

    python3 -m http.server 8080
    # then open http://localhost:8080/

## Before every commit

    python3 verify-facts.py

This is the project's most important gate. It holds the verified facts from
`../discoveryPRD.md` §4 and asserts each appears in `index.html`, and that a list
of forbidden phrases (`FDA`, `CE mark`, `clinically validated`, `for sale`, …)
does not. It strips HTML tags and collapses whitespace before matching, because
values are split across elements (`<span>10</span><span>ag/mL</span>`).

**If it fails, fix the page — never the checker.** A public page that misstates a
patent number or drifts into an unsupportable claim is the only failure here with
real consequences.

## How the assets were made

| Asset | Provenance |
|---|---|
| `device-cutout.webp` | 4K still from the demo video at t=160.8 s (the moment the reading appears), rotated 90° CCW so the text reads horizontally, gray-world white balanced, background removed. WebP for alpha at 98 KB instead of 769 KB as PNG. |
| `device-photo.jpg` | The same corrected 4K frame, uncut. |
| `demo.mp4` | `IMG_3445.MOV` (4K HEVC, `rotation=-90`) → `transpose=2` to landscape, per-channel gain correction, 720p H.264. Two segments — sample application, then the result — with the processing wait elided. The page says so. |
| `certificate.jpg` | Page 1 of the grant certificate PDF, rasterised. |
| `wordmark.webp` | The real wordmark, lifted from a photo of the product's presentation case by keying on *yellowness* (gold letters, neutral background) rather than brightness. |
| `case-brand.jpg` | That same case, cropped to its face. |
| `og-cover.png` | 1200×630, screenshotted from a local HTML page by headless Chrome — crisp text, nothing generated. |
| `icon-*.png` | Rendered the same way from an SVG of the mark (a differential-pulse-voltammetry peak). |

Colour and orientation were verified numerically, not by eye: the corrected
frames sit within ~1.6 of neutral on green-minus-blue.

## Design notes

Single **dark** theme. The palette is taken from the physical product — matte
black case, gold wordmark — not invented. Cyan appears only as the "signal"
colour inside the mechanism diagram, justified by the device's blue display.

JavaScript is enhancement only. With it disabled the page is complete: every
method step is readable and every diagram stage is visible.

Deployed as a GitHub Pages **project** site, so every asset path is relative and
the manifest's `start_url`/`scope` are `"./"`.

## Live

Not yet deployed.
