# Loading refinement awaiting final browser review

This branch prepares a focused loading improvement while preserving the independently published original concept. It does not alter the two editorial demos.

The first mobile lab run on the original REDLINE main was 75 / LCP 5.9s / CLS 0; Sanctuary was 77 / LCP 4.9s / CLS 0. Both accessibility scores were 100. REDLINE had a hero WebP request timeout in that run. These are single lab results, not field measurements.

The responsive hero is now discovered in initial HTML, with AVIF and WebP alternatives. Opening text no longer waits for a JavaScript repaint. Sanctuary preloads its original headline fonts and renders only the 13 used original Lucide icons (6,451 bytes including the full licence), replacing the full 357,796-byte icon library and the unused 72,435-byte animation library. All imagery uses the same approved source masters and framing.

Local build/source checks are recorded separately. Final browser verification and a fresh performance run are pending after the Edge browser connection dropped. The already verified main remains the shareable review demo until that check is completed.
