import { useState } from "react";
import axios from "axios";
import YouTube from "react-youtube";
import { FaStar } from "react-icons/fa";
import SearchComponent from "./SearchComponent";
import { Movie, WatchProviders } from "./Types";

export default function Header() {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
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
    } catch {
      setErrorMessage("Erro ao buscar trailer no YouTube.");
    }
  };

  const fetchMovieDetails = async (movieId: number, isTv: boolean) => {
    try {
      const endpoint = isTv ? `/tv/${movieId}` : `/movie/${movieId}`;
      const [detailsResponse, providersResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}${endpoint}`, {
          params: {
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            language: "pt-BR",
            append_to_response: "credits,genres",
          },
        }),
        axios.get(
          `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}${endpoint}/watch/providers`,
          {
            params: {
              api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
            },
          }
        ),
      ]);

      const movieData = {
        ...detailsResponse.data,
        watchProviders: providersResponse.data,
      };

      setSelectedMovie(movieData);
      fetchTrailer(movieData.title || movieData.name);
    } catch {
      setErrorMessage("Erro ao carregar detalhes do filme/série.");
    }
  };

  const renderWatchProviders = (providers: WatchProviders | undefined) => {
    if (!providers) {
      return (
        <div className="mt-4">
          <h3 className="text-white font-bold mb-2">Onde Assistir</h3>
          <p className="text-gray-400 text-sm">
            Informação não disponível para sua região.
          </p>
        </div>
      );
    }

    const sections = [
      { title: "Streaming", data: providers.flatrate },
      { title: "Alugar", data: providers.rent },
      { title: "Comprar", data: providers.buy },
    ];

    return (
      <div className="mt-4">
        <h3 className="text-white font-bold mb-2">Onde Assistir</h3>
        {sections.map(
          (section) =>
            section.data &&
            section.data.length > 0 && (
              <div key={section.title} className="mb-3">
                <h4 className="text-gray-400 text-sm mb-2">{section.title}:</h4>
                <div className="flex flex-wrap gap-2">
                  {section.data.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex items-center bg-gray-800 rounded-lg p-2"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-6 h-6 rounded"
                      />
                      <span className="text-white text-sm ml-2">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    );
  };

  return (
    <>
     
     <header className="fixed w-full top-0 left-0 bg-black bg-opacity-80 z-40">
  <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 py-3">
    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-red-600 text-center flixrecom-style mb-2 md:mb-0">
      flixrecom
    </h1>
    <nav className="flex gap-4 items-center text-gray-300">
      <SearchComponent 
        onSearchResults={setSearchResults}
        onError={setErrorMessage}
      />
    </nav>
  </div>
</header>

      {errorMessage && (
        <div className="container mx-auto mt-20 text-center text-red-500">
          {errorMessage}
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
                className="bg-gray-800 p-2 rounded cursor-pointer transform hover:scale-105 transition-transform duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
            <button
              className="absolute top-3 right-3 text-white bg-red-500 px-3 py-1 text-sm rounded hover:bg-red-600 transition-colors"
              onClick={() => {
                setSelectedMovie(null);
                setTrailerId(null);
              }}
            >
              Fechar
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[90vh] overflow-y-auto">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  {selectedMovie.title || selectedMovie.name}
                </h2>

                <img
                  src={
                    selectedMovie.backdrop_path
                      ? `https://image.tmdb.org/t/p/w500${selectedMovie.backdrop_path}`
                      : "/placeholder.jpg"
                  }
                  alt={selectedMovie.title || selectedMovie.name}
                  className="w-full rounded-lg shadow-lg"
                />

                <p className="text-gray-300">{selectedMovie.overview}</p>

                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-semibold">Lançamento:</span>{" "}
                    {new Date(
                      selectedMovie.release_date ||
                        selectedMovie.first_air_date ||
                        ""
                    ).toLocaleDateString("pt-BR")}
                  </p>

                  <div className="flex items-center">
                    <span className="text-gray-300 font-semibold mr-2">
                      Avaliação:
                    </span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i <
                            Math.round((selectedMovie.vote_average || 0) / 2)
                              ? "text-yellow-400"
                              : "text-gray-600"
                          } w-4 h-4`}
                        />
                      ))}
                      <span className="text-gray-400 ml-2">
                        ({selectedMovie.vote_count} votos)
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300">
                    <span className="font-semibold">Gêneros:</span>{" "}
                    {selectedMovie.genres
                      ?.map((genre) => genre.name)
                      .join(", ")}
                  </p>

                  <p className="text-gray-300">
                    <span className="font-semibold">Elenco Principal:</span>{" "}
                    {selectedMovie.credits?.cast
                      .slice(0, 3)
                      .map((actor) => actor.name)
                      .join(", ")}
                  </p>

                  {renderWatchProviders(
                    selectedMovie.watchProviders?.results?.BR
                    
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Trailer</h3>
                {trailerId ? (
                  <div className="relative pt-[56.25%]">
                    <YouTube
                      videoId={trailerId}
                      opts={{
                        width: "100%",
                        height: "100%",
                        playerVars: {
                          autoplay: 0,
                        },
                      }}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">Trailer não disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}