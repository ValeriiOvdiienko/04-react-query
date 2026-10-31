import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import MovieModal from "../MovieModal/MovieModal";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

// Імпортуємо ReactPaginate так, як ви це робили у файлі пагінації
import ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";
import type { ComponentType } from "react";
import css from "../App/App.module.css";

type ModuleWithDefault<T> = { default: T };
const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default;

import type { Movie } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";
import type { TmdbSearchMovieResponse } from "../../services/movieService";

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState<number>(1); // Перейменовано для точної відповідності ТЗ

  const openModal = (movie: Movie) => setSelectedMovie(movie);
  const closeModal = () => setSelectedMovie(null);

  const { data, error, isError, isSuccess, isFetching } = useQuery<
    TmdbSearchMovieResponse,
    Error
  >({
    queryKey: ["movies", searchQuery, page],
    queryFn: async () => {
      const response = await fetchMovies(searchQuery, page);
      if (!response) {
        return {
          results: [],
          total_pages: 0,
          total_results: 0,
          page: page,
        };
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

  useEffect(() => {
    if (isSuccess && movies.length === 0 && searchQuery.trim().length > 0) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, movies.length, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Перевірка, чи є активний пошуковий запит
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <>
      <SearchBar onSubmit={handleSearch} />

      {!isError && totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}

      {hasQuery && isFetching && <Loader />}

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
