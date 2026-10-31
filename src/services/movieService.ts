import axios from "axios";
import type { Movie } from "../types/movie";

interface TmdbSearchMovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export default async function fetchMovies(query: string): Promise<Movie[]> {
  const myKey = import.meta.env.VITE_TMDB_TOKEN;

  const options = {
    method: "GET",
    url: `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${myKey}`,
    },
  };

  const response = await axios.request<TmdbSearchMovieResponse>(options);

  console.log(response.data.results);

  return response.data.results;
}
