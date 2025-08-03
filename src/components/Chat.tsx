"use client";
import { useEffect, useState } from "react";

type Article = {
  title: string;
  url: string;
  source_country: string;
};

export default function Chat({ query = "politics" }: { query?: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/world-news?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
      })
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) return <p>Loading…</p>;
  if (!articles.length) return <p>No articles found.</p>;

  return (
    <ul>
      {articles.map((a, i) => (
        <li key={i}>
          <a href={a.url} target="_blank" rel="noopener noreferrer">
            {a.title}
          </a>
          <span> ({a.source_country})</span>
        </li>
      ))}
    </ul>
  );
}
