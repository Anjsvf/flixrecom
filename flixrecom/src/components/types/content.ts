export type ApiResponseItem = {
  id: string;
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];  // Adicionado para suportar a identificação de documentários
  watch_providers?: {
    results: {
      BR?: {
        flatrate?: { provider_name: string }[];
        free?: { provider_name: string }[];
        ads?: { provider_name: string }[];
      };
    };
  };
  credits?: {
    cast: { name: string }[];
  };
  seasons?: { air_date: string; season_number: number }[];
};

export type Content = {
  id: string;
  title: string;
  overview: string;
  backdrop_path: string | null;  
  release_date?: string;
  first_air_date?: string;
  type: "Filme" | "Série" | "Documentário";
  trailerId?: string | null;
  cast?: string[];
  latestSeason?: { air_date: string; season_number: number } | null;  // Modificado para permitir null
  newEpisodes?: boolean;
  streamingPlatforms?: string[];
  genre_ids?: number[]; 
};