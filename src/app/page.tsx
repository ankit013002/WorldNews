import {
  ArticleType,
  getLocationsOfArticles,
} from "@/app/utils/LocationSystem";
import World from "@/r3f/World";

export default async function Home() {
  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("pageSize", "15");
  url.searchParams.set("category", "politics");
  url.searchParams.set("apiKey", process.env.NEWS_API_KEY!);

  const response = await fetch(url.toString());
  const resJson = await response.json();
  const articles: ArticleType[] = resJson.articles;

  await getLocationsOfArticles(articles);

  console.log(articles);
  const refinedArticles = articles.filter(
    (article) => article.location?.lat != null && article.location?.lon != null
  );
  console.log(refinedArticles);

  return (
    <div className="min-h-screen min-w-screen flex flex-col justify-items-center items-center gap-y-5">
      {/* <NewsData /> */}
      {/* {articles.map((article, index) => {
        return (
          <div key={index} className="card bg-base-100 w-[50vw] shadow-sm">
            <figure>
              {article.urlToImage && article.urlToImage.length > 0 && (
                <Image
                  src={article.urlToImage}
                  alt="Image"
                  width={1000}
                  height={1000}
                />
              )}
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
      })} */}
      <World articles={refinedArticles} />
    </div>
  );
}
