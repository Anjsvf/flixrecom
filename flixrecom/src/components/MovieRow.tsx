"use client";

import { useEffect, useState } from "react";
import axios from "axios";

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

export default function Banner() {
  const [content, setContent] = useState<Content[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [category, setCategory] = useState<"movie" | "tv" | "anime" | "documentary">("movie");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Content | null>(null);

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

  const validateContent = (item: any): Content | null => {
    if (!item.id || (!item.title && !item.name)) return null;
    return {
      id: item.id,
      title: item.title || undefined,
      name: item.name || undefined,
      backdrop_path: item.backdrop_path || null,
      overview: item.overview || "",
      release_date: item.release_date || undefined,
      first_air_date: item.first_air_date || undefined,
      likes: Math.floor(Math.random() * 1000),
    };
  };

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

      const updatedContent = response.data.results.map(validateContent).filter(Boolean) as Content[];
      setContent(updatedContent);
    } catch (error) {
      console.error("Erro ao buscar conteúdo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, [category]);

  useEffect(() => {
    fetchContent();
  }, [category, selectedGenre, selectedYear]);

  const handleCategoryChange = (newCategory: "movie" | "tv" | "anime" | "documentary") => {
    setCategory(newCategory);
    setSelectedGenre(null);
    setSelectedYear(null);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="banner p-4">
      <div className="flex justify-between items-center mb-6">
        {/* Filtros de Categoria */}
        <div className="flex gap-4">
          {["movie", "tv", "anime", "documentary"].map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded ${
                category === cat ? "bg-red-500 text-white" : "bg-gray-700 text-white"
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

       
        <div className="flex gap-4">
          <select
            className="bg-gray-700 text-white px-4 py-2 rounded"
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
            className="bg-gray-700 text-white px-4 py-2 rounded w-32"
            placeholder="Digite o ano"
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(Number(e.target.value) || null)}
          />
        </div>
      </div>

     
      {loading ? (
        <p className="text-white">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {content.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 p-4 rounded-lg cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={
                  item.backdrop_path
                    ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                    : "/placeholder.jpg"
                }
                alt={item.title || item.name || "Sem título disponível"}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="text-white mt-2 font-bold">{item.title || item.name}</h3>
              <p className="text-gray-400">
                {new Date(item.release_date || item.first_air_date || "").getFullYear()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center overflow-y-auto z-50">
          <div className="bg-gray-900 p-4 rounded-md max-w-md mx-auto relative overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-white bg-red-500 px-3 py-1 text-sm rounded"
              onClick={closeModal}
            >
              Fechar
            </button>
            <h2 className="text-xl font-bold text-white mb-3">
              {selectedItem.title || selectedItem.name}
            </h2>
            <p className="text-gray-400 text-sm italic mb-2">
              Tipo: {selectedItem.first_air_date ? "Série" : "Filme"}
            </p>
            <img
              src={
                selectedItem.backdrop_path
                  ? `https://image.tmdb.org/t/p/w500${selectedItem.backdrop_path}`
                  : "/placeholder.jpg"
              }
              alt={selectedItem.title || selectedItem.name}
              className="w-full h-32 object-cover rounded mb-3"
            />
            <p className="text-gray-300">{selectedItem.overview}</p>
            <p className="mt-4 text-gray-400 text-sm">
              Relevante para: {selectedItem.likes} usuários
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
