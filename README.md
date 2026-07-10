# Watson (Standalone Web App)

This is a self-contained, dependency-free version of Watson that runs as a plain
website — no FlutterFlow, no build step, no Android Studio. It's the same
logic and UI we built together, just packaged so it can run anywhere a
browser can, including as an installable app on Android and iOS.

## Files
- `index.html` — the page shell (loads React, Babel, and Tailwind from CDN)
- `app.jsx` — the actual app (solver, wizard, grid, etc.)
- `manifest.json` — makes it installable ("Add to Home Screen" becomes a real app icon)
- `sw.js` — lets it work offline once loaded
- `icon-192.png` / `icon-512.png` — app icons

## Option 1: Just test it on your phone right now
1. Host these 5 files somewhere free and simple:
   - **GitHub Pages** (free, if you're comfortable with GitHub), or
   - **Netlify Drop** (netlify.com/drop — literally drag the folder in, get a URL instantly, no account needed)
2. Open the URL on your phone. Add it to your home screen (Android: Chrome menu
   → "Add to Home Screen"; iPhone: Safari Share icon → "Add to Home Screen").
3. Send the URL to your testers — same steps for them.

## Option 2: Get it onto the actual Google Play Store
This uses the same files, no FlutterFlow needed:
1. Host the files (Option 1, step 1) so you have a public HTTPS URL.
2. Go to **pwabuilder.com**, paste your URL.
3. PWABuilder scans it, confirms it's installable, and generates a signed
   **Android App Bundle (.aab)** for you — this is the exact same file format
   Google Play requires, and PWABuilder-generated Android apps are an
   officially supported publishing path (they wrap your site in what Google
   calls a "Trusted Web Activity").
4. Upload that .aab to Google Play Console like any other app.

## A note on the code itself
This was converted from the version running inside Claude:
- Swapped Claude's built-in storage for regular browser `localStorage`
  (works the same way, just standard web tech instead of an Anthropic-specific API)
- Swapped the `lucide-react` icon library for small hand-written SVG icons,
  since `lucide-react` needs a bundler (like the one FlutterFlow/Vite/etc.
  provide) and this setup intentionally has none

Everything else — the deduction solver, turn-order wizard, likelihood
estimates, and reveal speech — is identical to what we tested together.
