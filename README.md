# Pratyasa — patent IN 429867, on the record

Static one-page site: granted patent IN 429867, the *Langmuir* 2025 paper,
and footage of the working prototype. No framework, no build step, no
third-party requests.

## Run locally
    python3 -m http.server 8080
then open http://localhost:8080/

## Before every commit
    python3 verify-facts.py
Locks the page to the verified facts in `../discoveryPRD.md` §4 and blocks
forbidden claims. If it fails, fix the page, not the checker.

## How assets were made
- device-photo.jpg — IMG_3582.jpg, gray-world white balance + crop + resize (Pillow)
- device-cutout.png — background removal on the corrected photo, transparent PNG
- certificate.jpg — first page of the grant certificate PDF, rasterised
- demo.mp4 — IMG_3445.MOV trimmed to the measurement window, 720p H.264
- og-cover.png / icons — rendered from local HTML by headless Chrome

Live: https://007u5h4r.github.io/pratyasa/  (set in Task 9)
