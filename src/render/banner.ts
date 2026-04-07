import { ThumbnailInfo } from "../../types/movie";
import fallbackImg from "../assets/movie_fallback_image.svg";

export const renderTopRatedMovie = (movie: ThumbnailInfo) => {
  const rate = document.querySelector(".rate-value");
  const title = document.querySelector(".title");
  const backgroundImg: HTMLImageElement | null =
    document.querySelector(".background-img");

  if (!title || !rate || !backgroundImg) {
    throw new Error("최고 평점 영화 렌더링에 필요한 요소를 찾을 수 없습니다.");
  }
  title.textContent = movie.title;
  rate.textContent = movie.vote_average.toString();
  backgroundImg.src = movie.poster_path
    ? `${import.meta.env.VITE_TMDB_IMG_URL}${movie.poster_path}`
    : fallbackImg;
};
