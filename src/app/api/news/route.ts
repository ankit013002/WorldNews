import {
  ArticleType,
  getLocationsOfArticles,
} from "@/app/utils/LocationSystem";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json({
      status: 400,
      message: "Category doesn't exist",
    });
  }

  try {
    const url = new URL("https://newsapi.org/v2/top-headlines");
    url.searchParams.set("pageSize", "25");
    url.searchParams.set("category", category);
    url.searchParams.set("apiKey", process.env.NEWS_API_KEY!);

    const response = await fetch(url.toString());
    const resJson = await response.json();
    const articles: ArticleType[] = resJson.articles;

    await getLocationsOfArticles(articles);

    console.log(articles);
    const refinedArticles = articles.filter(
      (article) =>
        article.location?.lat != null && article.location?.lon != null
    );
    console.log(refinedArticles);
    return NextResponse.json({
      status: 200,
      message: "Category doesn't exist",
      articles: refinedArticles,
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({
        status: 500,
        message: `Server side error: ${err}`,
      });
    } else {
      return NextResponse.json({
        status: 500,
        message: "Unknown Error",
      });
    }
  }
}
