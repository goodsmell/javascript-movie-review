import { makeMovieThumbnail } from "./thumnailManager";
import { Movie, ThumbnailInfo } from "../types/movie";

export const renderMoviesList = (
  popularMovies: Pick<Movie, "title" | "poster_path" | "vote_average">[],
) => {
  const thumbnailList = document.querySelector(".thumbnail-list");

  popularMovies.forEach((movie) => {
    const movieThumbnail = makeMovieThumbnail(movie);

    thumbnailList?.appendChild(movieThumbnail);
  });
};

export const renderTopRatedMovie = (movie: ThumbnailInfo) => {
  const rate = document.querySelector(".rate-value");
  const title = document.querySelector(".title");
  const backgroundImg: HTMLImageElement | null =
    document.querySelector(".background-img");
  title!.textContent = movie.title;
  rate!.textContent = movie.vote_average.toString();
  backgroundImg!.src = `${import.meta.env.VITE_TMDB_IMG_URL}${movie.poster_path}`;
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

  thumbnailList!.appendChild(fragment);
};

export const removeSkeleton = () => {
  const skeletonNodes = document.querySelectorAll(".movie-skeleton");
  skeletonNodes.forEach((node) => node.remove());
};
