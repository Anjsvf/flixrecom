"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type ApiResponseItem = {
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
};

type Content = {
  title: string;
  overview: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  type: "Filme" | "Série";
};

export default function Banner() {
  const [content, setContent] = useState<Content | null>(null);
  const [isUpcoming, setIsUpcoming] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const endpoints = isUpcoming
          ? ["/movie/upcoming", "/tv/on_the_air"]
          : ["/movie/now_playing", "/tv/airing_today"];

        const [moviesResponse, seriesResponse] = await Promise.all(
          endpoints.map((path) =>
            axios.get(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}${path}`, {
              params: {
                api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                language: "pt-BR",
              },
            })
          )
        );

        const allContent: Content[] = [
          ...moviesResponse.data.results.map((item: ApiResponseItem) => ({
            title: item.title || item.name || "Sem título",
            overview: item.overview || "Descrição não disponível.",
            backdrop_path: item.backdrop_path || "",
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            type: "Filme",
          })),
          ...seriesResponse.data.results.map((item: ApiResponseItem) => ({
            title: item.title || item.name || "Sem título",
            overview: item.overview || "Descrição não disponível.",
            backdrop_path: item.backdrop_path || "",
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            type: "Série",
          })),
        ];

        const validContent = allContent.filter((item) => {
          const currentDate = new Date();
          const releaseDate = new Date(item.release_date || item.first_air_date || "");
          return isUpcoming ? releaseDate > currentDate : releaseDate <= currentDate;
        });

        const randomContent =
          validContent[Math.floor(Math.random() * validContent.length)];
        setContent(randomContent || null);
      } catch (error) {
        console.error("Erro ao buscar conteúdo:", error);
      }
    };

    fetchContent();
  }, [isUpcoming]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpcoming((prev) => !prev);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!content) return null;

  return (
    <div
      className="relative h-[300px] md:h-[500px] bg-cover bg-center text-white"
      style={{
        backgroundImage: content.backdrop_path
          ? `url(https://image.tmdb.org/t/p/original${content.backdrop_path})`
          : "url(/placeholder.jpg)",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="absolute bottom-5 left-5 p-4 md:bottom-10 md:left-10 lg:left-20 lg:bottom-20">
        <h2 className="text-2xl md:text-4xl font-bold text-white">
          {content.title}{" "}
          <span className="text-sm md:text-base font-light">
            ({content.type} -{" "}
            {isUpcoming ? "Em breve" : "Lançado recentemente"})
          </span>
        </h2>
        <p className="text-sm md:text-base text-gray-300 mt-2 max-w-xs md:max-w-md overflow-hidden text-ellipsis line-clamp-3">
          {content.overview}
        </p>
        <button className="mt-4 px-4 py-2 md:px-6 md:py-3 bg-red-600 rounded hover:bg-red-700 transition-all duration-300 ease-in-out">
          {isUpcoming ? "EM BREVE" : "LANÇADO RECENTEMENTE"}
        </button>
      </div>
    </div>
  );
}
