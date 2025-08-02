import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.NEWS_DATA_API_KEY;
    if (!key) {
      console.error("Missing NEWS_DATA_API_KEY in environment");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const res = await fetch(`https://www.newsdata.io/api/1/news?apikey=${key}`);
    if (!res.ok) {
      const text = await res.text();
      console.error("NewsData API error:", res.status, text);
      return NextResponse.json(
        { error: `NewsData API responded ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message || "Unknown error" },
        { status: 500 }
      );
    } else {
      console.error("Unexpected /api/news error:", err);
    }
  }
}
