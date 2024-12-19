"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import MovieRow from "@/components/MovieRow";
import FilterMenu from "@/components/FilterMenu";

export default function Home() {
  const [category, setCategory] = useState("movies");

  const requests = {
    movies: `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie`,
    series: `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/tv`,
    documentaries: `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/discover/movie?with_genres=99`,
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />
      <Banner />
      <div className="container mx-auto px-4">
        <FilterMenu setCategory={setCategory} />
        {/* <MovieRow title="Popular" fetchUrl={requests[category]} /> */}
        <MovieRow
          title="Top Rated"
          fetchUrl={`${requests[category]}&sort_by=vote_average.desc`}
        />
      </div>
    </div>
  );
}
