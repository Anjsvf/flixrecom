"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MovieDetailsModal from "./MovieDetailsModal";

interface Content {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  likes?: number;
}

interface Genre {
  id: number;
  name: string;
}

interface Video {
  type: string;
  site: string;
  key: string;
}

export default function Banner() {
  const [content, setContent] = useState<Content[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [category, setCategory] = useState<"movie" | "tv" | "anime" | "documentary">("movie");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Content | null>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);

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
          params: { api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY },
        });

        const genresInPortuguese = response.data.genres.map((genre: Genre) => ({
          id: genre.id,
          name: translateGenreToPortuguese(genre.name),
        }));

        setGenres(genresInPortuguese);
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

  const fetchWatchProviders = async (itemId: number) => {
    try {
      const mediaType = category === "tv" || category === "anime" ? "tv" : "movie";
      const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/${mediaType}/${itemId}/watch/providers`;
      const response = await axios.get(url, {
        params: { api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar provedores:", error);
      return null;
    }
  };

  const handleItemClick = async (item: Content) => {
    try {
      const [newTrailerId, watchProvidersData] = await Promise.all([
        fetchTrailer(item.id),
        fetchWatchProviders(item.id)
      ]);
      
      setSelectedItem({
        ...item,
        "watch/providers": watchProvidersData
      } as Content);
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
        const updatedContent = response.data.results
          .map(validateContent)
          .filter(Boolean) as Content[];
        setContent(updatedContent);
      } catch (error) {
        console.error("Erro ao buscar conteúdo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [category, selectedGenre, selectedYear]);

  const translateGenreToPortuguese = (genreName: string): string => {
    const translations: Record<string, string> = {
      Action: "Ação",
      Adventure: "Aventura",
      Animation: "Animação",
      Comedy: "Comédia",
      Crime: "Crime",
      Documentary: "Documentário",
      Drama: "Drama",
      Family: "Família",
      Fantasy: "Fantasia",
      History: "História",
      Horror: "Terror",
      Music: "Música",
      Mystery: "Mistério",
      Romance: "Romance",
      "Science Fiction": "Ficção Científica",
      "TV Movie": "Filme para TV",
      Thriller: "Suspense",
      War: "Guerra",
      Western: "Faroeste",
    };
    return translations[genreName] || genreName;
  };

  const validateContent = (item: Record<string, unknown>): Content | null => {
    if (
      typeof item.id !== "number" ||
      (!item.title && !item.name) ||
      typeof item.overview !== "string" ||
      (item.backdrop_path !== null && typeof item.backdrop_path !== "string")
    ) {
      return null;
    }

    return {
      id: item.id,
      title: typeof item.title === "string" ? item.title : undefined,
      name: typeof item.name === "string" ? item.name : undefined,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      release_date:
        typeof item.release_date === "string" ? item.release_date : undefined,
      first_air_date:
        typeof item.first_air_date === "string" ? item.first_air_date : undefined,
      likes: Math.floor(Math.random() * 1000),
    };
  };

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
    <p className="text-white text-center">Carregando...</p>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {content.map((item) => (
        <div
          key={item.id}
          className="bg-gray-800 p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md"
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