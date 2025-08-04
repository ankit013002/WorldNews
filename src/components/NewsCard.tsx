import { ArticleType } from "@/app/utils/LocationSystem";
import { Camera } from "@react-three/fiber";
import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";

interface NewsCardProps {
  article: ArticleType;
  setExpand?: Dispatch<SetStateAction<boolean>>;
  setIsAnyOpen?: Dispatch<SetStateAction<boolean>>;
  setThisOpen?: Dispatch<SetStateAction<boolean>>;
  setFocusedArticle?: Dispatch<SetStateAction<boolean>>;
  camera?: Camera;
}

const NewsCard = ({
  article,
  setExpand,
  setIsAnyOpen,
  setThisOpen,
  setFocusedArticle,
  camera,
}: NewsCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium text-white">
            {article.source?.name || "Unknown Source"}
          </span>
        </div>
        {setExpand && setIsAnyOpen && setThisOpen && camera ? (
          <button
            className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setExpand(false);
              setIsAnyOpen(false);
              setThisOpen(false);
              camera.translateZ(-3);
            }}
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : (
          setFocusedArticle &&
          setIsAnyOpen && (
            <button
              className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setIsAnyOpen(false);
                setFocusedArticle(false);
              }}
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )
        )}
      </div>

      <div
        className="flex-1 overflow-auto p-6 pt-2"
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {article.urlToImage != null && article.urlToImage.length > 0 && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <Image
              src={article.urlToImage!}
              alt={article.title}
              width={1000}
              height={1000}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-100 mb-4 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-300">
          {article.author && (
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{article.author}</span>
            </div>
          )}
          {article.publishedAt && (
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          )}
        </div>

        {article.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Summary
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {article.description}
            </p>
          </div>
        )}

        {article.content && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Content Preview
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {truncateText(article.content, 300)}
            </p>
          </div>
        )}

        {article.location && (
          <div className="mb-4 p-4 bg-gray-50/25 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-semibold text-gray-200">Location</span>
            </div>
            <p className="text-sm text-gray-200">
              Latitude: {article.location.lat!.toFixed(4)}, Longitude:{" "}
              {article.location.lon!.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {article.url && (
        <div className="p-6 pt-4 border-t border-gray-100">
          <div className="flex justify-end items-center">
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Read Full Article
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NewsCard;
