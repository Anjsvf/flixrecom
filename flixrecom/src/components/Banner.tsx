"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Movie } from "../../types/Movie";

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
      const endpoint = isUpcoming
        ? ["/movie/upcoming", "/tv/on_the_air"]
        : ["/movie/now_playing", "/tv/airing_today"];

      const [moviesResponse, seriesResponse] = await Promise.all(
        endpoint.map((path) =>
          axios.get(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}${path}`, {
            params: {
              api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
              language: "pt-BR",
            },
          })
        )
      );

      const allContent = [
        ...moviesResponse.data.results.map((item: any) => ({
          ...item,
          type: "Filme",
          date: item.release_date,
        })),
        ...seriesResponse.data.results.map((item: any) => ({
          ...item,
          type: "Série",
          date: item.first_air_date,
        })),
      ];

      const validContent = allContent.filter((item) => {
        const currentDate = new Date();
        const releaseDate = new Date(item.date);
        return isUpcoming ? releaseDate > currentDate : releaseDate <= currentDate;
      });

      const randomContent =
        validContent[Math.floor(Math.random() * validContent.length)];
      setContent(randomContent || null);
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
      className="relative h-[500px] bg-cover bg-center text-white"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${content.backdrop_path})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="absolute bottom-10 left-10">
        <h2 className="text-4xl font-bold">
          {content.title}{" "}
          <span className="text-sm font-light">
            ({content.type} -{" "}
            {isUpcoming ? "Em breve" : "Lançado recentemente"})
          </span>
        </h2>
        <p className="max-w-md text-gray-300 mt-2">{content.overview}</p>
        <button className="mt-4 px-6 py-3 bg-red-600 rounded hover:bg-red-700">
          {isUpcoming ? "EM BREVE" : "LANÇADO RECENTEMENTE"}
        </button>
      </div>
    </div>
  );
}
