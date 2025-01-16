"use client";

import { Content } from '../components/types/content';
import YouTube from "react-youtube";

interface ContentModalProps {
  content: Content | null;
  showModal: boolean;
  onClose: () => void;
}

const ContentModal = ({ content, showModal, onClose }: ContentModalProps) => {
  if (!showModal || !content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-4 rounded-md max-w-4xl w-full mx-4 relative overflow-hidden flex flex-col md:flex-row md:gap-6 max-h-screen">
        <button
          className="absolute top-3 right-3 text-white bg-red-500 px-3 py-1 text-sm rounded"
          onClick={onClose}
        >
          Fechar
        </button>
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-3">
            {content.title}
          </h2>
          <p className="text-gray-400 text-sm italic mb-2">
            Tipo: {content.type}
          </p>
          <img
            src={
              content.backdrop_path
                ? `https://image.tmdb.org/t/p/w500${content.backdrop_path}`
                : "/placeholder.jpg"
            }
            alt={content.title}
            className="w-full h-32 object-cover rounded mb-3"
          />
          <p className="mb-3 text-gray-300 text-sm">{content.overview}</p>
          <p className="text-gray-300 text-sm">
            Ano de Lançamento:{" "}
            {new Date(
              content.release_date || content.first_air_date || ""
            ).getFullYear()}
          </p>
          <p className="text-gray-300 text-sm">
            Principais Artistas: {content.cast?.join(", ")}
          </p>
          {content.streamingPlatforms && content.streamingPlatforms.length > 0 && (
            <p className="text-green-400 text-sm mt-2">
              Disponível em: {content.streamingPlatforms.join(", ")}
            </p>
          )}
          {content.type === "Série" && content.latestSeason && (
            <p className="text-gray-300 text-sm">
              Nova Temporada: {content.latestSeason.season_number} (Lançada em {new Date(content.latestSeason.air_date).getFullYear()})
            </p>
          )}
          {content.type === "Série" && content.newEpisodes && (
            <p className="text-gray-300 text-sm">
              Novos Episódios Disponíveis
            </p>
          )}
        </div>
        <div className="flex-1 mt-4 md:mt-0">
          {content.trailerId ? (
            <YouTube
              videoId={content.trailerId}
              opts={{ width: "100%", height: "390" }}
            />
          ) : (
            <p className="text-gray-400">Trailer não disponível.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentModal;