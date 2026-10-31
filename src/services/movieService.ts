import axios from "axios";
import type { Movie } from "../types/movie";

export interface TmdbSearchMovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export async function fetchMovies(
  query: string,
  page: number,
): Promise<TmdbSearchMovieResponse> {
  const myKey = import.meta.env.VITE_TMDB_TOKEN;

  const options = {
    method: "GET",
    url: `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${page}`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${myKey}`,
    },
  };

  const response = await axios.request<TmdbSearchMovieResponse>(options);

  console.log(response.data);

  return response.data;
}
