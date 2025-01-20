
"use client"


import Header from "../components/Header";
import Banner from "../components/Banner";
import MovieRow from "../components/MovieRow";
import Footer from "@/components/Footer";


export default function Home() {

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />
      <Banner />
      <div className="container mx-auto px-4">
       
        <MovieRow
         
        />
      </div>
      <Footer/>
    </div>
  );
}
