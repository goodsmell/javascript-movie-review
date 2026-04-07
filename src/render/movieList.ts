import { createMovieThumbnail } from "./thumbnail";
import { Movie } from "../../types/movie";
import { mapToThumbnailInfo } from "../utils/mapToThumbnailInfo";

export const renderMoviesList = (movies: Movie[]) => {
  const thumbnailList = document.querySelector(".thumbnail-list");

  if (!thumbnailList) {
    throw new Error("thumbnail-list 요소를 찾을 수 없습니다.");
  }

  const thumbnailInfos = mapToThumbnailInfo(movies);

  thumbnailInfos.forEach((movie) => {
    const movieThumbnail = createMovieThumbnail(movie);
    thumbnailList.appendChild(movieThumbnail);
  });
};
