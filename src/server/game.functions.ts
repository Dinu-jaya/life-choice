import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SceneInputSchema = z.object({
  playerName: z.string().min(1).max(40),
  turn: z.number().int().min(1).max(7),
  stats: z.object({
    skills: z.number(),
    money: z.number(),
    happiness: z.number(),
  }),
  history: z
    .array(z.object({ scene: z.string(), choice: z.string() }))
    .max(10),
});

export type SceneChoice = {
  text: string;
  effects: { skills: number; money: number; happiness: number };
  consequence: string;
};

export type Scene = {
  id: string;
  title: string;
  description: string;
  choices: SceneChoice[];
};

const SceneToolSchema = {
  type: "object" as const,
  properties: {
    title: { type: "string", description: "Short, fun title (max 6 words)" },
    description: {
      type: "string",
      description: "1-2 short, simple sentences describing the situation joyfully.",
    },
    choices: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          text: { type: "string", description: "Short choice label, max 8 words" },
          consequence: {
            type: "string",
            description: "One-line happy outcome shown after picking",
          },
          effects: {
            type: "object",
            properties: {
              skills: { type: "integer", minimum: -10, maximum: 20 },
              money: { type: "integer", minimum: -10, maximum: 20 },
              happiness: { type: "integer", minimum: -10, maximum: 20 },
            },
            required: ["skills", "money", "happiness"],
            additionalProperties: false,
          },
        },
        required: ["text", "consequence", "effects"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "description", "choices"],
  additionalProperties: false,
};

export const generateScene = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SceneInputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const phase =
      data.turn <= 3 ? "college life" : data.turn <= 5 ? "internship era" : "first job adventure";

    const historyText =
      data.history.length === 0
        ? "(this is the very first scene)"
        : data.history.map((h, i) => `${i + 1}. ${h.scene} → chose: ${h.choice}`).join("\n");

    const sys = `You write grounded, emotionally honest mini-scenes for a "Life Decisions Simulator" about a real college student.
TONE: mature, realistic, character-driven — like a modern coming-of-age series (Normal People, Euphoria-lite, The Bear). Adult themes handled tastefully: relationships, sex, money stress, mental health, ambition, partying, identity, family pressure, ethics. No profanity. No graphic content. Never preachy.
RULES:
- Title: max 6 words. Evocative, specific, never cute or whimsical. Examples: "The 2 A.M. Text", "Rent Is Due Friday", "She Asked About Us".
- Description: 2–3 sentences (max 60 words). Concrete sensory details — a place, a person, a feeling. Show stakes. Second person ("You…").
- Real college life: dorms, parties, lectures, internships, breakups, group projects, financial aid, late nights, hookups, family calls, advisor meetings, side hustles, identity crises.
- Vary settings and emotional registers across turns. Reference earlier choices when natural — make it feel like one continuous life.
- Provide 3 distinct choices, each a real meaningful tradeoff. Each choice text ≤ 10 words, written as the player's voice/action.
- Effects: balanced and realistic. Tradeoffs matter — gaining one stat often costs another. Range -15 to +15.
- Consequence: one short, honest line about what actually happens. No moralizing. No emojis.`;

    const user = `Player: ${data.playerName}
Turn: ${data.turn} of 7 (${phase})
Current stats — Skills:${data.stats.skills} Money:${data.stats.money} Happiness:${data.stats.happiness}
History:
${historyText}

Generate the next scene now.`;

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_scene",
              description: "Emit the next story scene",
              parameters: SceneToolSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_scene" } },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Too many requests, please wait a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
      const t = await res.text();
      console.error("Scene gen failed", res.status, t);
      throw new Error("Scene generation failed");
    }

    const json = await res.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No scene returned");
    const parsed = JSON.parse(args) as Omit<Scene, "id">;
    return { ...parsed, id: `t${data.turn}-${Date.now()}` } as Scene;
  });

/* ---------- Image generation ---------- */

const ImageInputSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  playerName: z.string().min(1).max(40),
  vibe: z.string().max(80).optional(),
});

const STYLE_PREAMBLE =
  "Cinematic editorial illustration, moody and atmospheric. Painterly digital art with soft film grain, rich shadows, and a contemporary indie-film color palette (deep teals, dusty rose, amber streetlights, midnight blue). Naturalistic young adult characters with real proportions and subtle expressions. Square 1:1 framing, shallow depth of field feel. NO text, NO letters, NO words anywhere in the image. Think A24 movie poster meets New Yorker cover.";

// Simple in-memory LRU cache for image data URLs
const imageCache = new Map<string, string>();
const MAX_CACHE = 50;

function hashKey(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return String(h);
}

export const generateSceneImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ImageInputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `${STYLE_PREAMBLE}

Scene title: "${data.title}"
Scene moment: ${data.description}
Main character: a young college-age person named ${data.playerName}, recurring protagonist with consistent friendly look.
${data.vibe ? `Mood: ${data.vibe}.` : ""}

Illustrate the scene as a single charming square picture.`;

    const cacheKey = hashKey(prompt);
    const cached = imageCache.get(cacheKey);
    if (cached) return { imageUrl: cached };

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("Image gen failed", res.status, t);
      throw new Error("Image generation failed");
    }

    const json = await res.json();
    const imageUrl: string | undefined =
      json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("No image returned");

    imageCache.set(cacheKey, imageUrl);
    if (imageCache.size > MAX_CACHE) {
      const firstKey = imageCache.keys().next().value;
      if (firstKey) imageCache.delete(firstKey);
    }

    return { imageUrl };
  });