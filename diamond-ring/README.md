# LOVE ME — Diamond Ring of Light ✧

A responsive, dependency-free interactive website inspired by a sparkling, rotating silver ring shown in a reference video.

## Features

- Generative canvas particle diamond ring with 3D rotation, twinkles, orbiting dust, and mouse parallax.
- Refined dark editorial design, responsive for phones and desktops.
- Interactive sparkle effect on tap, music controls, accessibility labels, and reduced-motion handling.
- Original synthesized ambient background music with automatic start attempt and first-interaction fallback.
- Works on GitHub Pages without a build step or API keys.

## Soundtrack and autoplay

This repository **does not contain the commercially released song “Love Me”**. Its built-in soundtrack is original synthesizer ambience. To use music for which you have the required rights, place the file in `assets/` and set `TRACK_URL = './assets/love-me.mp3'` in `script.js`.

Modern browsers (including Safari on iPhone) block unmuted autoplay until a user gesture. The site attempts autoplay on load and starts music on the first interaction if blocked. This is a browser security restriction; there is no reliable cross-browser workaround.

## Run locally

Open `index.html`, or serve it using:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

No third-party JavaScript libraries and no network API calls are required. Google Fonts is optional and falls back to system fonts when offline.