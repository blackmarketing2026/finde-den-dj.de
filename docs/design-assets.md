# DJKompass: Event / Sound / People

The new landing page uses `src/LandingPage.jsx` and `src/landing.css`. Shared forms, dashboards and navigation use `src/theme.css`.

## Hero asset

- Workspace file: `public/images/dj-session.webp`
- Source: OpenAI built-in ImageGen, generated for this project (not a real DJ profile or customer testimonial).
- The generated PNG was converted to WebP at quality 88 for delivery (~81 KB). It is an atmospheric decorative image with an empty alt attribute.
- Original generated file: `C:/Users/Steve/.codex/generated_images/01a0ec07-54e3-7ff0-bd2b-554b7d8a3899/exec-80d310cd-68db-40ca-afd0-c4f0820485fa.png`.

### Final generation prompt

Use case: photorealistic-natural. Asset type: wide cinematic hero photograph for a modern DJ event matching website. Create a landscape 16:9 editorial photograph, 2048x1152 if available. Close-up waist-level scene of a real professional DJ's hands mixing on an unbranded high-end black mixer and turntable, DJ torso in black clothing on the RIGHT half, deck extends across lower third, shallow depth of field. Out-of-focus upscale celebration dance floor behind, dramatic warm amber lights with cool slate shadows and subtle haze, dark blacks, natural film grain, tactile genuine photography, energetic yet sophisticated wedding/private-event atmosphere rather than rave. Keep LEFT half especially dark and visually quiet as negative space for oversized cream typography added in code. No text, no logos, no watermarks, no legible product branding. Not a UI mockup, only the background photograph. No identifiable faces.

## Motion and accessibility

The hero uses pointer parallax, staggered headline entrances and a floating stamp. Further down, an event ticker, animated request routing, sound level bars, section reveals and hover transitions support the music theme. The pause button stops continuous animations; system reduced-motion settings disable all motion. No sound plays automatically.

## Lead flow

The opening form saves event, location and date into the request draft. The music selector adds genres to the same draft. The request then asks for music (if not selected), name and email, with optional details inside a disclosure. A summary and explicit consent precede submission. The schematic routing visualization is marked as an example and does not imply that a particular number of DJs or offers is guaranteed.
