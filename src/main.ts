import image from "../templates/images/star_filled.png";
import { fetchPopularMovies } from "./api/fetchMovies";
import { extractThumbnailInfo } from "./thumnailManager";
import Logo from "./Logo";
import {
  renderMoviesList,
  renderTopRatedMovie,
  renderSkeleton,
  removeSkeleton,
} from "./render";
import SearchForm from "./SearchForm";
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
  alert("영화 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
} finally {
  removeSkeleton();
}

addEventListener("load", () => {
  const app = document.querySelector("#app");
  const buttonImage = document.createElement("img");
  buttonImage.src = image;

  if (app) {
    app.appendChild(buttonImage);
  }
});
