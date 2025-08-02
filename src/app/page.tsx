import NewsData from "@/components/NewsData";
import World from "@/r3f/World";
import Image from "next/image";
import { GetLocationsOfArticles } from "./utils/LocationSystem";

export type ArticleType = {
  author: string;
  description: string;
  publishedAt: string;
  source: {
    id?: string;
    name: string;
  };
  title: string;
  urL: string;
  urlToImage: string;
  content?: string;
  country: string | null;
};

export default async function Home() {
  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("pageSize", "15");
  url.searchParams.set("category", "technology");
  url.searchParams.set("apiKey", process.env.NEWS_API_KEY!);

  const response = await fetch(url.toString());
  const resJson = await response.json();
  const articles: ArticleType[] = resJson.articles;

  const serializedArticles = await GetLocationsOfArticles(articles);

  console.log(articles);

  return (
    <div className="min-h-screen min-w-screen flex flex-col justify-items-center items-center gap-y-5">
      {/* <NewsData /> */}
      {articles.map((article, index) => {
        return (
          <div key={index} className="card bg-base-100 w-[50vw] shadow-sm">
            <figure>
              <Image
                src={article.urlToImage}
                alt="Image"
                width={1000}
                height={1000}
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">Card Title</h2>
              <p>
                A card component has a figure, a body part, and inside body
                there are title and actions parts
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Buy Now</button>
              </div>
            </div>
          </div>
        );
      })}
      {/* <World /> */}
    </div>
  );
}
