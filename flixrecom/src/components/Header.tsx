import { useState } from "react";
import axios from "axios";
import { FaSearch, FaStar } from "react-icons/fa";

interface Movie {
  id: number;
  title: string;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  credits: { cast: { id: number; name: string }[] };
  production_countries: { name: string }[];
}

interface ApiResponse {
  results: Movie[];
}

export default function Header() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setErrorMessage("");
      const params = {
        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
        language: "pt-BR",
        include_adult: false,
        query,
      };

      const { data } = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/multi`,
        { params }
      );

      if (data.results.length === 0) {
        setErrorMessage("Nenhum resultado encontrado.");
      } else {
        setSearchResults(data.results);
      }
    } catch {
      setErrorMessage("Erro ao buscar resultados. Tente novamente.");
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
      const params = {
        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
        language: "pt-BR",
        query: value,
        include_adult: false,
      };

      const { data } = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/multi`,
        { params }
      );

      setSuggestions(data.results);
    } catch {
      setErrorMessage("Erro ao buscar sugestões.");
    }
  };

  const handleClear = () => {
    setQuery("");
    setSearchResults([]);
    setSuggestions([]);
    setErrorMessage("");
  };

  const fetchMovieDetails = async (movieId: number, isTv: boolean) => {
    try {
      const endpoint = isTv ? `/tv/${movieId}` : `/movie/${movieId}`;
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}${endpoint}`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
            append_to_response: "credits,genres",
          },
        }
      );

      setSelectedMovie(data);
    } catch {
      setErrorMessage("Erro ao carregar detalhes do filme/série.");
    }
  };

  return (
    <>
      <header className="fixed w-full top-0 left-0 bg-black bg-opacity-80 z-40">
        <div className="container mx-auto flex justify-between items-center px-4 py-3">
          <h1 className="text-2xl font-bold text-red-600">flixrecom</h1>
          <nav className="flex gap-4 items-center text-gray-300">
            <div className="relative flex items-center">
              <button
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                onClick={handleSearch}
                aria-label="Pesquisar"
              >
                <FaSearch />
              </button>
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Pesquise por filmes, séries ou animes..."
                className="pl-10 bg-gray-700 text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
                aria-label="Campo de busca"
              />
              <button
                onClick={handleClear}
                className="ml-2 text-gray-400 hover:text-white transition"
                aria-label="Limpar busca"
              >
                Limpar
              </button>
            </div>
          </nav>
        </div>
      </header>

      {errorMessage && (
        <div className="container mx-auto mt-20 text-center text-red-500">
          {errorMessage}
        </div>
      )}

      {/* Renderiza sugestões */}
      {suggestions.length > 0 && query && (
        <div className="absolute bg-gray-700 w-full mt-2 rounded-lg shadow-lg z-50">
          <ul className="text-white">
            {suggestions.slice(0, 5).map((movie) => (
              <li
                key={movie.id}
                className="p-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => {
                  setQuery(movie.title || movie.name);
                  handleSearch();
                  setSuggestions([]);
                }}
              >
                {movie.title || movie.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Renderiza os resultados */}
      {searchResults.length > 0 && (
        <div className="container mx-auto mt-20 p-4">
          <h2 className="text-xl font-bold text-white">Resultados da Pesquisa:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-800 p-2 rounded cursor-pointer"
                onClick={() => fetchMovieDetails(movie.id, !!movie.first_air_date)}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/placeholder.jpg"
                  }
                  alt={movie.title || movie.name}
                  className="w-full h-[300px] object-cover rounded"
                />
                <p className="text-white mt-2">{movie.title || movie.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
