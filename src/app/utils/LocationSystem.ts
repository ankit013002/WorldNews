import { createOpenAI } from "@ai-sdk/openai";

export type LatLon = { lat: number; lon: number; country: string | null };
export type ArticleType = {
  author: string;
  description: string;
  publishedAt: string;
  source: {
    id?: string;
    name: string;
  };
  title: string;
  url: string;
  urlToImage: string;
  content?: string;
  location?: {
    country?: string | null;
    lat?: number;
    lon?: number;
  };
};

async function ollamaChat(prompt: string): Promise<string> {
  const res = await fetch("http://localhost:11434/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:3b",
      messages: [
        {
          role: "system",
          content:
            'You are a strict JSON API. Reply ONLY with JSON {"place":"<text>"} or the word null.',
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 50,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

const llama = createOpenAI({
  baseURL: process.env.LLAMA_API_URL || "http://localhost:11434/v1",
  apiKey: "ollama",
});
const MODEL_ID = process.env.LLAMA_MODEL_NAME || "llama3.2:1b";

export async function extractPlace(
  article: ArticleType
): Promise<string | null> {
  const seed = `${article.title ?? ""}\n${article.description ?? ""}\n${
    article.content ?? ""
  }`;

  const prompt = `Task: Extract ONE most specific geographic location from the
news text.
- If the text says where it is talking about take that.
- If the text doesn't specify, then figure out where the test is from.
- Prefer city > region/state > country.
- If none found, reply exactly: null
- Output ONLY JSON like {"place":"<text>"} OR the word null.
- If the location could refer to multiple places, include both region and country

Text:
${seed}`;

  const text = (await ollamaChat(prompt)).trim();

  if (text === "null") return null;

  try {
    const obj = JSON.parse(text);
    return typeof obj.place === "string" && obj.place.trim()
      ? obj.place.trim()
      : null;
  } catch {
    const line = text
      .split("\n")[0]
      .replace(/^["[{(]|["\]})]$/g, "")
      .trim();
    return line.toLowerCase() === "null" ? null : line || null;
  }
}

export async function geocode(place: string): Promise<LatLon | null> {
  const qs = new URLSearchParams({
    q: place,
    format: "json",
    limit: "1",
    addressdetails: "1",
  });
  const url = `https://nominatim.openstreetmap.org/search?${qs.toString()}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "WorldNewsApp/1.0" },
  });
  let hits = [];
  try {
    hits = await res.json();
  } catch {
    return null;
  }
  const hit = hits[0];
  if (!hit) return null;

  return {
    lat: parseFloat(hit.lat),
    lon: parseFloat(hit.lon),
    country: hit.address?.country ?? null,
  };
}

export async function getLocationsOfArticles(
  articles: ArticleType[]
): Promise<(LatLon | null)[]> {
  const results: (LatLon | null)[] = [];

  for (const article of articles) {
    console.log("Article Title:", article.title);
    console.log("Article Description:", article.description);
    try {
      const place = await extractPlace(article);
      console.log(place);
      if (place) {
        const geocodedValues = await geocode(place);
        if (geocodedValues != null) {
          article.location = {
            country: geocodedValues?.country,
            lat: geocodedValues.lat,
            lon: geocodedValues.lon,
          };
        }
      }
      console.log(article.location?.lat);
      console.log(article.location?.lon);
    } catch (err) {
      console.error("[pipeline]", err);
      results.push(null);
    }
  }
  return results;
}
