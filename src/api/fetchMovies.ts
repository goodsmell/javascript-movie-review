import { Movie } from "../../types/movie.ts";

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const accessToken = import.meta.env.VITE_ACCESS_TOKEN;

export const fetchPopularMovies = async (
  page: number,
): Promise<Movie[] | undefined> => {
  try {
    const response = await fetch(
      `${apiUrl}/movie/popular?language=ko-KR&page=${page}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    alert(error);
  }

  return undefined;
};
