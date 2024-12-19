import { useState, useEffect } from "react";
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
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    setErrorMessage("");

    try {
      const params = {
        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
        language: "pt-BR",
        include_adult: false,
        query: query,
      };

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/multi`,
        { params }
      );

      if (response.data.results.length === 0) {
        setErrorMessage("Nenhum resultado encontrado.");
      }

      setSearchResults(response.data.results);
    } catch (error) {
      setErrorMessage("Erro ao buscar resultados. Tente novamente.");
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
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

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/search/multi`,
        { params }
      );

      setSuggestions(response.data.results);
    } catch (error) {
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}${endpoint}`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
            append_to_response: "credits,genres",
          },
        }
      );

      setSelectedMovie(response.data);
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
                className="pl-10 bg-gray-700 text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button
                onClick={handleClear}
                className="ml-2 text-gray-400 hover:text-white transition"
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
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.jpg"}
                  alt={movie.title || movie.name}
                  className="w-full h-[300px] object-cover rounded"
                />
                <p className="text-white mt-2">{movie.title || movie.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center overflow-y-auto z-50">
          <div className="bg-gray-900 p-4 rounded-md max-w-md mx-auto relative overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-white bg-red-500 px-3 py-1 text-sm rounded"
              onClick={() => setSelectedMovie(null)}
            >
              Fechar
            </button>
            <h2 className="text-xl font-bold text-white mb-3">{selectedMovie.title || selectedMovie.name}</h2>
            <p className="text-gray-400 text-sm italic mb-2">
              Tipo: {selectedMovie.first_air_date ? "Série" : "Filme"}
            </p>
            <img
              src={selectedMovie.backdrop_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.backdrop_path}` : "/placeholder.jpg"}
              alt={selectedMovie.title || selectedMovie.name}
              className="w-full h-32 object-cover rounded mb-3"
            />
            <p className="mb-3 text-gray-300 text-sm">{selectedMovie.overview}</p>
            <p className="text-gray-300 text-sm">
              Ano de Lançamento: {new Date(selectedMovie.release_date || selectedMovie.first_air_date).getFullYear()}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              País: {selectedMovie.production_countries?.map((country) => country.name).join(", ")}
            </p>
            <div className="flex items-center mt-2">
              <p className="text-gray-300 text-sm mr-1">Classificação:</p>
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar
                  key={i}
                  className={`text-yellow-500 text-xs ${i < Math.round(selectedMovie.vote_average / 2) ? "" : "opacity-25"}`}
                />
              ))}
              <p className="text-gray-300 text-sm ml-1">({selectedMovie.vote_count} votos)</p>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              Gêneros: {selectedMovie.genres?.map((genre) => genre.name).join(", ")}
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Principais Atores: {selectedMovie.credits?.cast.slice(0, 3).map((actor) => actor.name).join(", ")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
