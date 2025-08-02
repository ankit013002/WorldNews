"use client";

import React, { useEffect, useState } from "react";

interface Article {
  title: string;
  description: string;
  country: string[];
  sourceUrl: string;
}

const NewsData = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((response) => response.json())
      .then((data) => {
        setArticles(data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (articles.length === 0) return <p>No articles found.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {articles.map((article, index) => (
        <li key={index} style={{ marginBottom: "1rem" }}>
          <h3>{article.title}</h3>
        </li>
      ))}
    </ul>
  );
};

export default NewsData;
