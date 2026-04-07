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

const moreButton = new MoreButton();
const searchForm = new SearchForm();
const logo = new Logo(resetToPopularView);

function bindComponentEvents() {
  moreButton.bindEvent();
  searchForm.bindEvent();
  logo.bindEvent();
}

function restorePopularViewUI() {
  const backgroundContainer = document.querySelector(".background-container");
  const sectionTitle = document.querySelector(".section-title");
  const notFoundContainer = document.querySelector(
    ".not-search-found-container",
  );

  if (backgroundContainer instanceof HTMLDivElement) {
    backgroundContainer.style.display = "flex";
  }

  if (sectionTitle) {
    sectionTitle.textContent = "지금 가장 인기 있는 영화";
  }

  notFoundContainer?.remove();
}

async function resetToPopularView() {
  try {
    PageStore.mode = "popular";
    PageStore.query = "";
    PageStore.page = 1;

    restorePopularViewUI();
    renderSkeleton();

    const { movies, nowPage, totalPages } = await fetchPopularMovies(
      PageStore.page,
    );

    PageStore.page = nowPage;
    PageStore.totalPages = totalPages;

    const thumbnails = extractThumbnailInfo(movies);

    if (PageStore.page === PageStore.totalPages) {
      moreButton.hide();
    } else {
      moreButton.show();
    }

    renderMoviesList(movies);
    renderTopRatedMovie(thumbnails[0]);
  } catch (error) {
    alert("영화 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    removeSkeleton();
  }
}

async function bootstrap() {
  bindComponentEvents();
  await resetToPopularView();
}

await bootstrap();
