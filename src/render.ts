import { makeMovieThumbnail } from "./thumnailManager";
import { ThumbnailInfo, Movie } from "../types/movie";
import fallbackImg from "./assets/movie_fallback_image.svg";
import { extractThumbnailInfo } from "./thumnailManager";

export const renderMoviesList = (movies: Movie[]) => {
  const thumbnailList = document.querySelector(".thumbnail-list");

  if (!thumbnailList) {
    throw new Error("thumbnail-list 요소를 찾을 수 없습니다.");
  }

  const thumbnailInfos = extractThumbnailInfo(movies);

  thumbnailInfos.forEach((movie) => {
    const movieThumbnail = makeMovieThumbnail(movie);
    thumbnailList.appendChild(movieThumbnail);
  });
};

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

export const renderSkeleton = () => {
  const thumbnailList = document.querySelector(".thumbnail-list");
  const fragment = new DocumentFragment();
  const skeleton = document.createElement("div");
  skeleton.className = "movie-skeleton";

  for (let i = 0; i < 20; i++) {
    const newNode = skeleton.cloneNode(true);
    fragment.appendChild(newNode);
  }

  if (!thumbnailList) {
    throw new Error("thumbnail-list 요소를 찾을 수 없습니다.");
  }
  thumbnailList.appendChild(fragment);
};

export const removeSkeleton = () => {
  const skeletonNodes = document.querySelectorAll(".movie-skeleton");
  skeletonNodes.forEach((node) => node.remove());
};
