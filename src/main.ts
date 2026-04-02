import image from "../templates/images/star_filled.png";
import { fetchPopularMovies } from "./api/fetchMovies";
import { extractThumbnailInfo } from "./thumnailManager";
import Logo from "./logo";
import {
  renderMoviesList,
  renderTopRatedMovie,
  renderSkeleton,
  removeSkeleton,
} from "./render";
import SearchForm from "./searchForm";
import PageStore from "./store";
import MoreButton from "./moreButton";

// 이벤트 바인딩
const moreButton = new MoreButton();
moreButton.bindEvent();
const searchForm = new SearchForm();
searchForm.bindEvent();
const logo = new Logo();
logo.bindEvent();

// 초기화면 렌더링
try {
  renderSkeleton();
  const { movies: popularMovies, totalPages: popularTotalPages } =
    await fetchPopularMovies(PageStore.popularMoviePage);
  removeSkeleton();

  if (PageStore.popularMoviePage === popularTotalPages) {
    moreButton.hide();
  }

  renderMoviesList(extractThumbnailInfo(popularMovies));
  renderTopRatedMovie(extractThumbnailInfo(popularMovies)[0]);
} catch (error) {
  alert(error);
}


addEventListener("load", () => {
  const app = document.querySelector("#app");
  const buttonImage = document.createElement("img");
  buttonImage.src = image;

  if (app) {
    app.appendChild(buttonImage);
  }
});
