import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import MovieModal from "../MovieModal/MovieModal";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Pagination from "../ReactPaginate/ReactPaginate";

import type { Movie } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";
import type { TmdbSearchMovieResponse } from "../../services/movieService";

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const openModal = (movie: Movie) => setSelectedMovie(movie);
  const closeModal = () => setSelectedMovie(null);

  const { data, error, isError, isFetching } = useQuery<
    TmdbSearchMovieResponse,
    Error
  >({
    queryKey: ["movies", searchQuery, currentPage],
    queryFn: async () => {
      const response = await fetchMovies(searchQuery, currentPage);
      if (!response || !response.results || response.results.length === 0) {
        throw new Error("No movies found for your request.");
      }
      return response;
    },
    enabled: searchQuery.trim().length > 0,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const movies = data?.results || [];
  const totalPages = data?.total_pages || 0;

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <>
      <SearchBar onSubmit={handleSearch} />

      {!isError && totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      {isFetching && <Loader />}

      {isError ? (
        <ErrorMessage />
      ) : (
        <MovieGrid movies={movies} onSelect={openModal} />
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}

      <Toaster position="top-center" />
    </>
  );
}
