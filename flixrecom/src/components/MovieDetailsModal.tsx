import React from 'react';
import YouTube from "react-youtube";
import { FaStar } from "react-icons/fa";

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProviders {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

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
  "watch/providers"?: {
    results: {
      BR?: WatchProviders;
    };
  };
}

interface MovieDetailsModalProps {
  movie: Movie | null;
  trailerId: string | null;
  onClose: () => void;
}

const MovieDetailsModal = ({ movie, trailerId, onClose }: MovieDetailsModalProps) => {
  if (!movie) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-3 right-3 text-white bg-red-500 px-3 py-1 text-sm rounded hover:bg-red-600 transition-colors"
          onClick={onClose}
        >
          Fechar
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {movie.title || movie.name}
            </h2>

            <img
              src={
                movie.backdrop_path
                  ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                  : "/placeholder.jpg"
              }
              alt={movie.title || movie.name}
              className="w-full rounded-lg shadow-lg"
            />

            <p className="text-gray-300">{movie.overview}</p>

            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="font-semibold">Lançamento:</span>{" "}
                {new Date(
                  movie.release_date || movie.first_air_date || ""
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
                        i < Math.round((movie.vote_average || 0) / 2)
                          ? "text-yellow-400"
                          : "text-gray-600"
                      } w-4 h-4`}
                    />
                  ))}
                  <span className="text-gray-400 ml-2">
                    ({movie.vote_count} votos)
                  </span>
                </div>
              </div>

              <p className="text-gray-300">
                <span className="font-semibold">Gêneros:</span>{" "}
                {movie.genres?.map((genre) => genre.name).join(", ")}
              </p>

              <p className="text-gray-300">
                <span className="font-semibold">Elenco Principal:</span>{" "}
                {movie.credits?.cast
                  .slice(0, 3)
                  .map((actor) => actor.name)
                  .join(", ")}
              </p>

              {renderWatchProviders(movie["watch/providers"]?.results?.BR)}
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
                  iframeClassName="absolute top-0 left-0 w-full h-full"
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
  );
};

export default MovieDetailsModal;