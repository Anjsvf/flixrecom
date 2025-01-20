
export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviders {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface Movie {
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
  watchProviders?: {
    results: {
      BR?: WatchProviders;
    };
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  type: string;
  site: string;
  key: string;
}export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviders {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface Movie {
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
  watchProviders?: {
    results: {
      BR?: WatchProviders;
    };
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  type: string;
  site: string;
  key: string;
}