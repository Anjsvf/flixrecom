"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import LoadingSpinner from './LoadingSpinner';
import ContentModal from './ContentModal';
import { ApiResponseItem, Content } from '../components/types/content';

export default function Banner() {
  const [content, setContent] = useState<Content | null>(null);
  const [isUpcoming, setIsUpcoming] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [oldContent, setOldContent] = useState<Content | null>(null);
  const [previousContentId, setPreviousContentId] = useState<string | null>(null);

  const fetchWatchProviders = async (id: string, type: "movie" | "tv") => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/${type}/${id}/watch/providers`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
          },
        }
      );
      const providers = response.data.results.BR;
      if (!providers) return [];
      
      const allProviders = [
        ...(providers.flatrate || []),
        ...(providers.free || []),
        ...(providers.ads || []),
      ];
      
      return [...new Set(allProviders.map(provider => provider.provider_name))];
    } catch (error) {
      console.error("Erro ao buscar provedores:", error);
      return [];
    }
  };

  const fetchTrailer = async (id: string, type: "movie" | "tv") => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/${type}/${id}/videos`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
          },
        }
      );
      const trailers = response.data.results.filter(
        (video: { type: string; site: string }) =>
          video.type === "Trailer" && video.site === "YouTube"
      );
      return trailers.length > 0 ? trailers[0].key : null;
    } catch (error) {
      console.error("Erro ao buscar trailer:", error);
      return null;
    }
  };

  const fetchCredits = async (id: string, type: "movie" | "tv") => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/${type}/${id}/credits`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
          },
        }
      );
      return response.data.cast.slice(0, 5).map((actor: { name: string }) => actor.name);
    } catch (error) {
      console.error("Erro ao buscar créditos:", error);
      return [];
    }
  };

  const fetchLatestSeason = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${id}`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
          },
        }
      );
      const seasons = response.data.seasons;
      const latestSeason = seasons[seasons.length - 1];
      const currentYear = new Date().getFullYear();
      const newEpisodes = new Date(latestSeason.air_date).getFullYear() === currentYear;
      return { latestSeason, newEpisodes };
    } catch (error) {
      console.error("Erro ao buscar temporada:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        if (content) {
          setOldContent(content);
          setIsTransitioning(true);
        }

        const endpoints = [
          "/movie/upcoming",
          "/tv/on_the_air",
          "/discover/movie?with_genres=99", 
          "/tv/popular" 
        ];

        const responses = await Promise.all(
          endpoints.map((path) =>
            axios.get(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}${path}`, {
              params: {
                api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                language: "pt-BR",
              },
            })
          )
        );

        const [upcomingMovies, onTheAirSeries, documentaries, popularSeries] = responses;

        const allContent: Content[] = [
          ...upcomingMovies.data.results.map((item: ApiResponseItem) => ({
            id: item.id,
            title: item.title || item.name || "Sem título",
            overview: item.overview || "Descrição não disponível.",
            backdrop_path: item.backdrop_path || "",
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            type: "Filme",
          })),
          ...onTheAirSeries.data.results.map((item: ApiResponseItem) => ({
            id: item.id,
            title: item.title || item.name || "Sem título",
            overview: item.overview || "Descrição não disponível.",
            backdrop_path: item.backdrop_path || "",
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            type: "Série",
          })),
          ...documentaries.data.results.map((item: ApiResponseItem) => ({
            id: item.id,
            title: item.title || item.name || "Sem título",
            overview: item.overview || "Descrição não disponível.",
            backdrop_path: item.backdrop_path || "",
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            type: "Documentário",
          })),
          ...popularSeries.data.results.map((item: ApiResponseItem) => ({
            id: item.id,
            title: item.title || item.name || "Sem título",
            overview: item.overview || "Descrição não disponível.",
            backdrop_path: item.backdrop_path || "",
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            type: "Série",
          }))
        ];

        const validContent = allContent.filter((item) => {
          const currentDate = new Date();
          const releaseDate = new Date(item.release_date || item.first_air_date || "");
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(currentDate.getDate() - 30);
          return isUpcoming ? releaseDate > currentDate : releaseDate >= thirtyDaysAgo && releaseDate <= currentDate;
        });

        if (validContent.length > 0) {
          let randomContent;
          do {
            randomContent = validContent[Math.floor(Math.random() * validContent.length)];
          } while (randomContent.id === previousContentId);

          const contentType = randomContent.type === "Documentário" ? "movie" : 
                            randomContent.type === "Filme" ? "movie" : "tv";
          
          const [trailerId, cast, streamingPlatforms] = await Promise.all([
            fetchTrailer(randomContent.id, contentType),
            fetchCredits(randomContent.id, contentType),
            fetchWatchProviders(randomContent.id, contentType)
          ]);

          let latestSeason = null;
          let newEpisodes = false;
          if (randomContent.type === "Série") {
            const seasonData = await fetchLatestSeason(randomContent.id);
            latestSeason = seasonData?.latestSeason;
            newEpisodes = seasonData?.newEpisodes || false;
          }

          setTimeout(() => {
            setContent({
              ...randomContent,
              trailerId,
              cast,
              latestSeason,
              newEpisodes,
              streamingPlatforms
            });
            setPreviousContentId(randomContent.id);
            setTimeout(() => {
              setIsTransitioning(false);
              setOldContent(null);
            },7);
          },1);
        }
      } catch (error) {
        console.error("Erro ao buscar conteúdo:", error);
        setIsTransitioning(false);
      }
    };

    fetchContent();
  }, [isUpcoming]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setIsUpcoming((prev) => !prev);
      }
    },6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  if (!content && !oldContent) {
    return (
      <div className="relative h-[300px] md:h-[500px] bg-black text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const currentDate = new Date();
  const releaseDate = new Date(content?.release_date || content?.first_air_date || "");
  const isUpcomingContent = releaseDate > currentDate;

  return (
    <div className="mt-[64px]">
      <div className="relative h-[300px] md:h-[500px] overflow-hidden">
        {oldContent && (
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ${
              isTransitioning ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{
              backgroundImage: oldContent.backdrop_path
                ? `url(https://image.tmdb.org/t/p/original${oldContent.backdrop_path})`
                : "url(/placeholder.jpg)",
              zIndex: 1,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
        )}

        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
            isTransitioning ? 'scale-100 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            backgroundImage: content?.backdrop_path
           
              ? `url(https://image.tmdb.org/t/p/original${content.backdrop_path})`
              : "url(/placeholder.jpg)",
            zIndex: 2,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className={`absolute bottom-5 left-5 p-4 md:bottom-10 md:left-10 lg:left-20 lg:bottom-20 transition-transform duration-1000 ${
            isTransitioning ? 'translate-x-[-100%] opacity-0' : 'translate-x-0 opacity-100'
          }`}>
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              {content?.title}{" "}
              <span className="text-sm md:text-base font-light">
                ({content?.type} - {isUpcomingContent ? "Em breve" : "Lançado recentemente"})
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-300 mt-2 max-w-xs md:max-w-md overflow-hidden text-ellipsis line-clamp-3">
              {content?.overview}
            </p>
            {content?.type === "Série" && content?.latestSeason && (
              <p className="text-sm md:text-base text-gray-300 mt-2">
                Nova Temporada: {content.latestSeason.season_number} (Lançada em {new Date(content.latestSeason.air_date).getFullYear()})
              </p>
            )}
            {content?.type === "Série" && content?.newEpisodes && (
              <p className="text-sm md:text-base text-gray-300 mt-2">
                Novos Episódios Disponíveis
              </p>
            )}
            {content?.streamingPlatforms && content.streamingPlatforms.length > 0 && (
              <p className="text-sm md:text-base text-green-400 mt-2">
                Disponível em: {content.streamingPlatforms.join(", ")}
              </p>
            )}
            <button
              className="mt-4 px-4 py-2 md:px-6 md:py-3 bg-red-600 rounded hover:bg-red-700 transition-all duration-300 ease-in-out"
              onClick={() => {
                setIsPaused(true);
                setShowModal(true);
              }}
            >
              Detalhes
            </button>
          </div>
        </div>
      </div>

      <ContentModal 
        content={content}
        showModal={showModal}
        onClose={() => {
          setIsPaused(false);
          setShowModal(false);
        }}
      />
    </div>
  );
}
