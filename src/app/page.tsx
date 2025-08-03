import {
  ArticleType,
  getLocationsOfArticles,
} from "@/app/utils/LocationSystem";
import World from "@/r3f/World";
import { FetchMockData } from "./utils/MockData";

export default async function Home() {
  // const url = new URL("https://newsapi.org/v2/top-headlines");
  // url.searchParams.set("pageSize", "25");
  // url.searchParams.set("category", "politics");
  // url.searchParams.set("apiKey", process.env.NEWS_API_KEY!);

  // const response = await fetch(url.toString());
  // const resJson = await response.json();
  // const articles: ArticleType[] = resJson.articles;

  // await getLocationsOfArticles(articles);

  // console.log(articles);
  // const refinedArticles = articles.filter(
  //   (article) => article.location?.lat != null && article.location?.lon != null
  // );
  // console.log(refinedArticles);

  const refinedArticles = FetchMockData();

  return (
    <div className="min-h-screen min-w-screen flex flex-col justify-items-center items-center gap-y-5">
      <World />
    </div>
  );
}
