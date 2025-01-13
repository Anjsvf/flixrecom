import { useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { Movie } from "./Types"; 

interface SearchProps {
  onSearchResults: (results: Movie[]) => void;
  onError: (message: string) => void;
  onSuggestionClick?: (movie: Movie) => void;
}

export default function SearchComponent({ onSearchResults, onError, onSuggestionClick }: SearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      onSearchResults([]);
      return;
    }

    setSuggestions([]); 

    if (!process.env.NEXT_PUBLIC_TMDB_API_KEY || !process.env.NEXT_PUBLIC_TMDB_BASE_URL) {
      onError("Configuração da API inválida.");
      return;
    }

 
    const match = query.match(/filmes que (?:vão|vai) chegar em (\w+) de (\d{4})/i);
    if (match) {
      await handleUpcomingMoviesSearch(match[1], match[2]);
      return;
    }


    const actorMatch = query.match(/filmes com (.+)/i);
    if (actorMatch) {
      await handleActorSearch(actorMatch[1]);
      return;
    }

    
    await handleDefaultSearch();
  };

  const handleUpcomingMoviesSearch = async (month: string, year: string) => {
    try {
      const monthNumber = new Date(Date.parse(month + " 1, 2021")).getMonth() + 1;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
            primary_release_date_gte: `${year}-${monthNumber.toString().padStart(2, "0")}-01`,
            primary_release_date_lte: `${year}-${monthNumber.toString().padStart(2, "0")}-31`,
          },
        }
      );

      if (response.data.results.length === 0) {
        onError("Nenhum resultado encontrado.");
      }
      onSearchResults(response.data.results);
    } catch {
      onError("Erro ao buscar resultados. Tente novamente.");
    }
  };

  const handleActorSearch = async (actorName: string) => {
    try {
      const actorResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/person`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
            query: actorName,
          },
        }
      );

      if (actorResponse.data.results.length === 0) {
        onError("Nenhum ator encontrado.");
        return;
      }

      const actorId = actorResponse.data.results[0].id;
      const movieResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
            with_cast: actorId,
          },
        }
      );

      if (movieResponse.data.results.length === 0) {
        onError("Nenhum filme encontrado para este ator.");
      }
      onSearchResults(movieResponse.data.results);
    } catch {
      onError("Erro ao buscar resultados. Tente novamente.");
    }
  };

  const handleDefaultSearch = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/multi`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
            query,
            include_adult: false,
          },
        }
      );

      if (response.data.results.length === 0) {
        onError("Nenhum resultado encontrado.");
      }
      onSearchResults(response.data.results);
    } catch {
      onError("Erro ao buscar resultados. Tente novamente.");
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/multi`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
            query: value,
            include_adult: false,
          },
        }
      );
      setSuggestions(response.data.results);
    } catch {
      onError("Erro ao buscar sugestões.");
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    onSearchResults([]);
  };

  return (
    <div className="relative flex items-center w-full md:w-auto">
      <button
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
        onClick={handleSearch}
      >
        <FaSearch />
      </button>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        placeholder="Pesquise por filmes, séries ou animes..."
        className="pl-10 bg-gray-700 text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none w-full md:w-80 lg:w-96 transition-all sm:text-sm md:text-base"
      />

      {query && (
        <button
          onClick={handleClear}
          className="ml-2 text-gray-400 hover:text-white transition"
        >
          Limpar
        </button>
      )}

      {suggestions.length > 0 && query && (
        <div className="absolute top-full left-0 right-0 bg-gray-700 mt-1 rounded-lg shadow-lg z-50">
          <ul className="text-white divide-y divide-gray-600">
            {suggestions.slice(0, 5).map((movie) => (
              <li
                key={movie.id}
                className="p-2 hover:bg-gray-600 cursor-pointer transition duration-200 ease-in-out"
                onClick={() => {
                  setQuery(movie.title || movie.name || "");
                  handleSearch();
                  setSuggestions([]);
                  if (onSuggestionClick) onSuggestionClick(movie);
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded-md">
                    <img
                      src={
                        movie.backdrop_path
                          ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                          : "/placeholder.jpg"
                      }
                      alt={movie.title || movie.name || "No title available"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg">
                    {movie.title || movie.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}