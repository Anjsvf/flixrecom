"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from './LoadingSpinner';
import axios from "axios";
import MovieDetailsModal from "./MovieDetailsModal";
import { Movie, Genre, Video, } from "./Types";

export default function Banner() {
  const [content, setContent] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [category, setCategory] = useState<"movie" | "tv" | "anime" | "documentary">("movie");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Movie | null>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);

  const fetchTranslation = async (itemId: number, mediaType: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/${mediaType}/${itemId}/translations`;
      const response = await axios.get(url, {
        params: { api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY },
      });

      const ptTranslation = response.data.translations.find(
        (t: { iso_639_1: string }) => t.iso_639_1 === "pt-BR" || t.iso_639_1 === "pt"
      );

      return ptTranslation?.data || null;
    } catch (error) {
      console.error("Erro ao buscar tradução:", error);
      return null;
    }
  };

  const fetchItemDetails = async (itemId: number, mediaType: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/${mediaType}/${itemId}`;
      const response = await axios.get(url, {
        params: {
          api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
          append_to_response: "credits,videos,watch/providers",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/genre/${category}/list`;
        if (category === "anime" || category === "tv") {
          url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/genre/tv/list`;
        } else if (category === "documentary") {
          url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/genre/movie/list`;
        }

        const response = await axios.get(url, {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
          },
        });

        setGenres(response.data.genres);
      } catch (error) {
        console.error("Erro ao buscar gêneros:", error);
      }
    };

    fetchGenres();
  }, [category]);

  const fetchTrailer = async (itemId: number) => {
    try {
      const mediaType = category === "tv" || category === "anime" ? "tv" : "movie";
      const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/${mediaType}/${itemId}/videos`;
      const response = await axios.get(url, {
        params: { api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY },
      });

      const trailer = response.data.results.find(
        (video: Video) => video.type === "Trailer" && video.site === "YouTube"
      );
      return trailer ? trailer.key : null;
    } catch (error) {
      console.error("Erro ao buscar trailer:", error);
      return null;
    }
  };

  const handleItemClick = async (item: Movie) => {
    try {
      const mediaType = category === "tv" || category === "anime" ? "tv" : "movie";
      const [details, translation] = await Promise.all([
        fetchItemDetails(item.id, mediaType),
        fetchTranslation(item.id, mediaType),
      ]);

      const newTrailerId = await fetchTrailer(item.id);

      const updatedItem: Movie = {
        ...item,
        ...details,
        title: translation?.title || details.title || item.title,
        name: translation?.name || details.name || item.name,
        overview: translation?.overview || details.overview || item.overview,
      };

      setSelectedItem(updatedItem);
      setTrailerId(newTrailerId);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setSelectedItem(item);
      setTrailerId(null);
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY as string,
          language: "pt-BR",
        };
        if (selectedGenre) params.with_genres = selectedGenre;
        if (selectedYear) {
          params.primary_release_year = selectedYear;
          params.first_air_date_year = selectedYear;
        }

        let url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/${category}`;
        if (category === "anime") {
          url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/tv`;
          params.with_genres = selectedGenre ? `${selectedGenre},16` : "16";
        } else if (category === "documentary") {
          url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie`;
          params.with_genres = selectedGenre ? `${selectedGenre},99` : "99";
        }

        const response = await axios.get(url, { params });
        const items = response.data.results;

        const detailedItems = await Promise.all(
          items.map(async (item: Movie) => {
            const mediaType = category === "tv" || category === "anime" ? "tv" : "movie";
            const details = await fetchItemDetails(item.id, mediaType);
            return {
              ...item,
              ...details,
              genres: details?.genres || [],
              credits: details?.credits || { cast: [] },
              watchProviders: details["watch/providers"] || {},
            };
          })
        );

        setContent(detailedItems);
      } catch (error) {
        console.error("Erro ao buscar conteúdo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [category, selectedGenre, selectedYear]);

  const handleCategoryChange = (
    newCategory: "movie" | "tv" | "anime" | "documentary"
  ) => {
    setCategory(newCategory);
    setSelectedGenre(null);
    setSelectedYear(null);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setTrailerId(null);
  };

  return (
    <div className="banner p-6 bg-black">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex flex-wrap gap-4 mb-4 sm:mb-6 justify-center sm:justify-start">
          {["movie", "tv", "anime", "documentary"].map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm md:text-base lg:text-lg font-semibold transition-colors duration-300 ease-in-out ${
                category === cat
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => handleCategoryChange(cat as typeof category)}
            >
              {cat === "movie"
                ? "Filmes"
                : cat === "tv"
                ? "Séries"
                : cat === "anime"
                ? "Animes"
                : "Documentários"}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-4 sm:mb-0">
          <select
            className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm shadow-md transition duration-200 ease-in-out hover:bg-gray-700"
            value={selectedGenre || ""}
            onChange={(e) => setSelectedGenre(Number(e.target.value) || null)}
          >
            <option value="">Todos os Gêneros</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="bg-gray-800 text-white px-4 py-2 rounded-full w-32 text-sm shadow-md transition duration-200 ease-in-out hover:bg-gray-700"
            placeholder="Digite o ano"
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(Number(e.target.value) || null)}
          />
        </div>
      </div>

      {loading ? (
    <div className="relative h-[300px] md:h-[500px] bg-black text-white flex items-center justify-center">
    <LoadingSpinner />
  </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {content.map((item) => (
            <div
              key={item.id}
              className="bg-black p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md"
              onClick={() => handleItemClick(item)}
            >
              <img
                src={
                  item.backdrop_path
                    ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                    : "/placeholder.jpg"
                }
                alt={item.title || item.name || "Sem título disponível"}
                className="w-full h-auto object-cover aspect-[2/3] rounded-md mb-2"
              />
              <h3 className="text-white mt-2 font-bold text-sm sm:text-base">
                {item.title || item.name}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                {new Date(
                  item.release_date || item.first_air_date || ""
                ).getFullYear()}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <MovieDetailsModal
          movie={selectedItem}
          trailerId={trailerId}
          onClose={closeModal}
        />
      )}
    </div>
  );
}