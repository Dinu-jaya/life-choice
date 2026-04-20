

## Goal
Add a generated illustration to every scene so each story beat has a vivid, on-theme image above the description.

## Approach
- **Server function `generateSceneImage`**: takes the scene title + short description and returns a base64 PNG (data URL). Uses Lovable AI Gateway with `google/gemini-2.5-flash-image` (Nano Banana) — cheap, fast, supports the chat-completions image modality already documented for this project.
- **Style lock for consistency**: prepend a fixed style preamble to every prompt so all 7 scenes feel like one illustrated storybook (e.g. "warm flat-vector illustration, soft pastel palette, cozy storybook lighting, no text, square 1:1 framing, friendly characters"). Also pass the player's name so the protagonist looks like a recurring character.
- **Wire into the game loop**: after a new AI scene is generated, kick off `generateSceneImage` in parallel. Store `imageUrl` on the scene in game state and in the localStorage save so refreshing keeps the picture.
- **Loading UX**: while the image is generating, show a soft animated gradient skeleton (same aspect ratio) inside the scenario card so the layout never jumps. Image fades in with Framer Motion when ready.
- **Failure handling**: if image generation fails or times out, keep the scene playable with no image (skeleton disappears, choices still work) — never block gameplay on art.
- **Endings get an image too**: the final summary screen generates one celebratory illustration matching the ending type (Successful Developer / Balanced Life / Burnout-rebrand) using the same style preamble.

## Technical details
- New server function in `src/server/ai.ts` (or wherever scene gen lives): `generateSceneImage({ title, description, playerName, vibe })` → `{ imageUrl: string }`. In-memory LRU cache keyed by a hash of the prompt to dedupe identical scenes across sessions.
- Game store: add `currentScene.imageUrl?: string` and `currentScene.imageStatus: "loading" | "ready" | "failed"`. Update save schema version (bump version, migrate old saves by clearing image fields — gameplay state preserved).
- `Scenario` card layout: image sits at the top, full card width, 16:9 or 1:1 with `rounded-2xl overflow-hidden`. Skeleton uses `animate-pulse` + a subtle shimmer.
- Concurrency: image request fires immediately after scene text resolves, in parallel with the user reading. Choices remain clickable even if the image is still loading — clicking just moves to the next scene.

## Out of scope
- No image editing / variations between scenes.
- No user-uploaded character portraits.
- No changes to story prompt, stats, music, or ending logic beyond adding one image to the summary.

