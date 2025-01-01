import { useState } from "react";
import axios from "axios";
import YouTube from "react-youtube";
import { FaSearch, FaStar } from "react-icons/fa";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genres?: { id: number; name: string }[];
  credits?: { cast: { id: number; name: string }[] };
  production_countries?: { name: string }[];
}

export default function Header() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [trailerId, setTrailerId] = useState<string | null>(null);

  const fetchTrailer = async (movieTitle: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: "snippet",
            q: `${movieTitle} trailer`,
            type: "video",
            key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
          },
        }
      );
      const video = response.data.items[0];
      setTrailerId(video.id.videoId);
    } catch (error) {
      setErrorMessage("Erro ao buscar trailer no YouTube.");
      console.error("Erro ao buscar trailer no YouTube:", error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setErrorMessage("");

    if (
      !process.env.NEXT_PUBLIC_TMDB_API_KEY ||
      !process.env.NEXT_PUBLIC_TMDB_BASE_URL
    ) {
      setErrorMessage("Configuração da API inválida.");
      return;
    }

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
        setErrorMessage("Nenhum resultado encontrado.");
      }

      setSearchResults(response.data.results);
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
      fetchTrailer(response.data.title || response.data.name);
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
    className="pl-10 bg-gray-700 text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none w-full md:w-auto"
  />
  {query && ( 
    <button
      onClick={handleClear}
      className="ml-2 text-gray-400 hover:text-white transition"
    >
      Limpar
    </button>
  )}
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
        <div className="absolute bg-gray-700 w-full mt-16 sm:mt-20 md:mt-24 rounded-lg shadow-lg z-50">
          {" "}
          {/* Margem maior e responsiva */}
          <ul className="text-white divide-y divide-gray-600">
            {suggestions.slice(0, 5).map((movie) => (
              <li
                key={movie.id}
                className="p-2 hover:bg-gray-600 cursor-pointer transition duration-200 ease-in-out"
                onClick={() => {
                  setQuery(movie.title || movie.name || "");
                  handleSearch();
                  setSuggestions([]);
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded-md">
                    {" "}
                    {/* Imagem responsiva */}
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
                  </span>{" "}
                  {/* Texto responsivo */}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="container mx-auto mt-20 p-4">
          <h2 className="text-xl font-bold text-white">
            Resultados da Pesquisa:
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-800 p-2 rounded cursor-pointer"
                onClick={() =>
                  fetchMovieDetails(movie.id, !!movie.first_air_date)
                }
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/placeholder.jpg"
                  }
                  alt={movie.title || movie.name || "Imagem não disponível"}
                  className="w-full h-[300px] object-cover rounded"
                />
                <p className="text-white mt-2 text-sm">
                  {movie.title || movie.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center overflow-y-auto z-50">
          <div className="bg-gray-900 p-4 rounded-md max-w-4xl mx-auto relative overflow-y-auto flex flex-col md:flex-row md:gap-6">
            <button
              className="absolute top-3 right-3 text-white bg-red-500 px-3 py-1 text-sm rounded"
              onClick={() => setSelectedMovie(null)}
            >
              Fechar
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-3">
                {selectedMovie.title || selectedMovie.name}
              </h2>
              <p className="text-gray-400 text-sm italic mb-2">
                Tipo: {selectedMovie.first_air_date ? "Série" : "Filme"}
              </p>
              <img
                src={
                  selectedMovie.backdrop_path
                    ? `https://image.tmdb.org/t/p/w500${selectedMovie.backdrop_path}`
                    : "/placeholder.jpg"
                }
                alt={selectedMovie.title || selectedMovie.name}
                className="w-full h-32 object-cover rounded mb-3"
              />
              <p className="mb-3 text-gray-300 text-sm">
                {selectedMovie.overview}
              </p>
              <p className="text-gray-300 text-sm">
                Ano de Lançamento:{" "}
                {new Date(
                  selectedMovie.release_date ||
                    selectedMovie.first_air_date ||
                    ""
                ).getFullYear()}
              </p>
              <p className="text-gray-300 text-sm">
                País:{" "}
                {selectedMovie.production_countries
                  ?.map((country) => country.name)
                  .join(", ")}
              </p>
              <div className="flex items-center mt-2">
                <p className="text-gray-300 text-sm mr-1">Classificação:</p>
                {Array.from({ length: 5 }, (_, i) => (
                  <FaStar
                    key={i}
                    className={`text-yellow-500 text-xs ${
                      i < Math.round((selectedMovie.vote_average || 0) / 2)
                        ? ""
                        : "opacity-25"
                    }`}
                  />
                ))}
                <p className="text-gray-300 text-sm ml-1">
                  ({selectedMovie.vote_count} votos)
                </p>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                Gêneros:{" "}
                {selectedMovie.genres?.map((genre) => genre.name).join(", ")}
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Principais Atores:{" "}
                {selectedMovie.credits?.cast
                  .slice(0, 3)
                  .map((actor) => actor.name)
                  .join(", ")}
              </p>
            </div>

            {/* Trailer */}
            <div className="flex-1 mt-4 md:mt-0">
              {trailerId && (
                <div className="w-full">
                  <YouTube
                    videoId={trailerId}
                    opts={{ width: "100%", height: "390" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
