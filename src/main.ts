import { fetchMoviesDetail, fetchPopularMovies } from "./api/fetchMovies";
import { mapToThumbnailInfo } from "./utils/mapToThumbnailInfo";
import { renderSkeleton, removeSkeleton } from "./render/skeleton";
import { renderMoviesList } from "./render/movieList";
import { renderTopRatedMovie } from "./render/banner";
import { getYear } from "./utils/getYear";
import SearchForm from "./components/SearchForm";
import MoreButton from "./components/moreButton";
import Logo from "./components/Logo";
import Modal from "./components/modal";
import Review from "./components/review";
import { LocalRatingStorage } from "./storage/RatingStorage";

import PageStore from "./store";
import MovieItem from "./components/MovieItem";

const moreButton = new MoreButton();
const searchForm = new SearchForm(moreButton);
const logo = new Logo(resetToPopularView);
const modal = new Modal();
const review = new Review(new LocalRatingStorage());
const movieItem = new MovieItem(async (movieId: string) => {
  try {
    const movieDetail = await fetchMoviesDetail(Number(movieId));

    modal.open({
      title: movieDetail.title,
      overview: movieDetail.overview,
      voteAverage: movieDetail.vote_average,
      posterPath: `https://image.tmdb.org/t/p/original/${movieDetail.poster_path}`,
      categoryText: `${getYear(movieDetail.release_date)} · ${movieDetail.genres.map((genre: { name: string }) => genre.name).join(", ")}`,
    });
    review.load(Number(movieId));
  } catch (error) {
    throw new Error("dd");
  }
});

function bindComponentEvents() {
  moreButton.bindEvent();
  searchForm.bindEvent();
  logo.bindEvent();
  movieItem.bindEvent();
  modal.bindEvent();
  review.bindEvent();
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

    const thumbnails = mapToThumbnailInfo(movies);

    if (PageStore.page === PageStore.totalPages) {
      moreButton.hide();
    } else {
      moreButton.show();
    }

    renderMoviesList(movies, { append: false });
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
